const User = require("../Model/User.model");
const mongoose = require("mongoose");
const { model } = mongoose;
const mongoosePaginate = require("mongoose-paginate-v2");

const paginate = async (model, pipeline = null, options = {}) => {
  const page = options.page || 1;
  const limit = options.limit || 10;
  const skip = (page - 1) * limit;

  const paginatedResults = {
    currentPage: page,
    perPage: limit,
  };

  try {
    let result, totalDocs;

    if (pipeline) {
      // Append pagination stages to the pipeline
      const paginationPipeline = [
        ...pipeline,
        { $skip: skip },
        { $limit: limit },
      ];

      result = await model.aggregate(paginationPipeline);
      totalDocs = await model.countDocuments(pipeline[0]?.$match || {});
    } else {
      // Default pagination
      result = await model
        .find({})
        .skip(skip)
        .limit(limit)
        .sort(options.sort || {})
        .select(options.select || "");

      totalDocs = await model.countDocuments({});
    }

    const totalPages = Math.ceil(totalDocs / limit);

    paginatedResults.totalPages = totalPages;
    paginatedResults.totalCount = totalDocs;
    paginatedResults.data = result;

    let obj = {
      status: true,
      data: paginatedResults,
      message: "Data fetched successfully",
    };
    return obj;
  } catch (error) {
    console.log("err", error);
    throw new Error("Pagination error: " + error.message);
  }
};

async function createUsersFromTemplate() {
  try {
    const templateUser = await User.findOne({}).lean();

    if (!templateUser) {
      console.log("No template user found in the database.");
      return;
    }

    const usersToCreate = 20;
    const createdUsers = [];

    // Create 20 new users based on the template user's data
    for (let i = 0; i < usersToCreate; i++) {
      const newUser = new User({
        ...templateUser, // Replicate all fields from template user
        fname: `${templateUser.fname}_${i + 1}`, // Example: appending _1, _2, ..., _20 to fname
        lname: `${templateUser.lname}_${i + 1}`, // Example: appending _1, _2, ..., _20 to lname
        email: `${templateUser.email.split("@")[0]}_${i + 1}@example.com`, // Example: appending _1, _2, ..., _20 to email
        // You may need to adjust how you generate the email based on your actual data structure
      });

      // Save the new user to the database
      const savedUser = await newUser.save();
      createdUsers.push(savedUser);
    }

    console.log(`${usersToCreate} new users created successfully.`);
    console.log("Created Users:", createdUsers);
  } catch (error) {
    console.error("Error creating users:", error);
  }
}

module.exports = { createUsersFromTemplate };

module.exports = { paginate };