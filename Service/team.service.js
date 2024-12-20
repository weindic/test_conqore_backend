const Team = require("../Model/team.modal");
const Games = require("../Model/Game.model");
const JoinTeam = require("../Model/joinTeam.modal");
const uploadFromBuffer = require("../cloudnary/imageUploader");
const UserService = require("./User.service");
const mongoose = require("mongoose");

exports.createTeam = async (req) => {
  let responseData = {};
  const userId = req.user?._id;
  try {
    const isNotUnique = await Team.find({ team_ucode: req.body.team_ucode });
    //  console.log(isNotUnique);
    if (isNotUnique.length) {
      return {
        data: null,
        status: false,
        message: "duplicate Team_ucode!!!",
      };
    }

    // let imageurl = await uploadFromBuffer.uploadFromBuffer(req);

    const team = new Team({
      teamName: req.body.teamName,
      teamBio: req.body.teamBio,
      teamLogo: req.body.teamLogo,
      team_ucode: req.body.team_ucode,
      selectedPlayers: req.body.selectedPlayers,
      isPrimary: req.body.isPrimary,
      selectedGame: req.body.selectedGame,
      team_status: req.body.team_status,
      createAt: Date.now(),
      createdBy: userId,
    });

    await team
      .save()
      .then((res) => {
        console.log(res);
        responseData = {
          data: res,
          status: true,
          message: "team create sucessfull",
        };
      })
      .catch((e) => {
        // console.log(e);
        responseData = {
          data: null,
          status: false,
          message: `somthing wrong happen !!  ${e}`,
        };

        return responseData;
      });
  } catch (e) {
    console.log(e);
  }

  console.log("resss", responseData);
  return responseData;
};

// join Team**************************
exports.joinTeam = async (req) => {
  let responseData = {};

  try {
    const admindata = await Team.findOne({ _id: req.body.team_id });
    console.log("data", admindata);

    // if (admindata.NumderOfPlayers == admindata.Expected_NumderOfPlayers) {
    //   responseData = {
    //     data: null,
    //     status: false,
    //     message: `Team is full`,
    //   };
    // } else {
    const adminid = admindata.createdBy;
    const teamid = admindata._id;
    const data = await UserService.Team_join_request(
      adminid,
      teamid,
      admindata.team_ucode,
      req
    );
    responseData = data;
    if (data.status == true) {
      const jointeam = new JoinTeam({
        team_id: req.body.team_id,
        player_id: req.body.player_id,
        status: req.body.status,
        admin_id: adminid,
        team_ucode: admindata.team_ucode,
        createAt: Date.now(),
      });

      await jointeam.save();
    }
    // }
  } catch (e) {
    console.log(e);
  }

  console.log("resss", responseData);
  return responseData;
};

exports.getTeamsData = async (req, res) => {
  const userId = req.user?._id.toString(); // Convert userId to string
  const { page = 1, limit = 10 } = req.body;
  const skip = (page - 1) * limit;

  try {
    const teamsAggregation = await Team.aggregate([
      {
        $match: {
          createdBy: userId, // Ensure the userId is a string for matching
        },
      },
      {
        $lookup: {
          from: "games",
          let: { selectedGame: { $toObjectId: "$selectedGame" } },
          pipeline: [
            { $match: { $expr: { $eq: ["$_id", "$$selectedGame"] } } },
          ],
          as: "gameDetails",
        },
      },
      {
        $unwind: {
          path: "$gameDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $sort: { reactionCount: -1 },
      },
      {
        $skip: skip,
      },
      {
        $limit: parseInt(limit),
      },
    ]);

    const totalTeams = await Team.countDocuments({
      createdBy: userId,
    });

    let final = {
      data: teamsAggregation,
      totalPages: page,
      totalCount: totalTeams,
    };
    res.status(200).json({
      status: true,
      data: final,
      message: "Data fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching teams data:", error);
    throw new Error("Failed to fetch teams data");
  }
};
