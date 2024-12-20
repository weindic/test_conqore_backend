const Service = require("../Service/User.service");
const OtpService = require("../Service/Otp.service");
const bcrypt = require("bcrypt");
const { isAllDataCome, checkDataisComing } = require("../helper");
const { updatePasswordMandatory } = require("../enums");
function AddMinutesToDate(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

exports.userLogin = async (req, res) => {
  const { email, password } = req.body;
  let responseData = {};

  if (!password || !email) {
    responseData = {
      data: null,
      status: false,
      message: "Please  fill  my file is you se  the data properly",
    };

    return res.send(responseData);
  }
  const data = await Service.User_full_dataSave(req);
  console.log("data", data);
  return res.send(data);
};

exports.updatePassword = async (req, res) => {
  const check = checkDataisComing(updatePasswordMandatory, req.body);
  if (!check.status) {
    return res.status(400).send(check);
  }

  try {
    const data = await Service.updatePassword(req.body, req.user);
    res.send(data);
  } catch (error) {
    console.error("Error in updatePassword controller:", error);
    res.status(500).send({
      status: false,
      message: "Internal server error",
    });
  }
};

exports.sendotp = async (req, res) => {
  const { email, otpType } = req.body;
  let responseData = {};
  if (!email || !otpType) {
    responseData = {
      data: null,
      status: false,
      message: "Please fill the data properly",
    };

    return res.send(responseData);
  }
  const data = await Service.sendOtp(req);
  res.send(data);
};
exports.otpverify = async (req, res) => {
  const { OtpValue, email, fname, lname } = req.body;
  // console.log("ffff", OtpValue, email, lname, fname);
  let responseData = {};
  if (!OtpValue || !email || !fname || !lname) {
    responseData = {
      data: null,
      status: false,
      message: "Please fill the data properly",
    };

    return res.send(responseData);
  }

  var now = new Date();
  var currentTime = AddMinutesToDate(now, 1);
  let data = {
    OtpValue,
    email,
    currentTime,
    fname,
    lname,
  };

  const otpverifyService = await OtpService.otpverifyService(data);
  console.log(otpverifyService);
  res.send(otpverifyService);
};

exports.usernameVerfy = async (req, res) => {
  if (!req.body.username) {
    responseData = {
      data: null,
      status: false,
      message:
        "Please fill the data mera code tihs not working please check and suggest me ",
    };

    return res.send(responseData);
  }
  const data = await Service.usernameVerfy(req.body.username);
  res.send(data);
};
exports.UserDataSave = async (req, res) => {
  // Check if a password is provided in the request
  if (req.body.password) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
    req.body.password = hashedPassword;
    const data = await Service.SaveUserNamenPass(req);
    res.send(data);
  } else {
    // Continue with saving the user data to the database and return the result
    const data = await Service.UserDataSave(req);
    res.send(data);
  }
};

// *********************send freind  request ***********************
exports.sendFreindRequest = async (req, res) => {
  const { userid, senderid, profile, name } = req.body;
  if (!userid || !senderid || !profile || !name) {
    responseData = {
      data: null,
      status: false,
      message: "please fill data properly!!",
    };

    return res.send(responseData);
  }
  const data = await Service.sendFreindRequest(req);
  res.send(data);
};

exports.followUser = async (req, res) => {
  const { userid, senderid, type } = req.body;
  if (!userid || !senderid) {
    responseData = {
      data: null,
      status: false,
      message: "please fill data properly!!",
    };

    return res.send(responseData);
  }
  const data = await Service.followUser(req);
  res.send(data);
};
// ***************request approve or deny

exports.RequestApprove_or_deny = async (req, res) => {
  console.log("req ", req.body);
  // if(!req.body.senderid  || !req.body.status){
  //   responseData = {
  //     data: null,
  //     status: false,
  //     message: "please fill data properly!!",
  //   };

  //   return res.send(responseData);
  // }
  const data = await Service.RequestApprove_or_deny(req);
  res.send(data);
};

// team join request approve or deny

exports.TeamJoin_RequestApprove_or_deny = async (req, res) => {
  console.log("req ", req.body);
  // if(!req.body.senderid  || !req.body.status){
  //   responseData = {
  //     data: null,
  //     status: false,
  //     message: "please fill data properly!!",
  //   };

  //   return res.send(responseData);
  // }
  const data = await Service.TeamJoin_RequestApprove_or_deny(req);
  res.send(data);
};
