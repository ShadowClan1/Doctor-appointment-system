const { User, Doctor, Appointment } = require("../model/Model");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const app = require("express").Router();
const bcrypt = require("bcrypt");
const uuid = require("uuid");
const client = require("../tawilio");
const { Op, QueryTypes } = require("sequelize");
const { sequelize } = require("../db");
const auth = require("../middle ware/auth");

app.post("/doc-signup", async (req, res) => {
  let id = uuid.v4();
  let email = req.body.email;
  let password = req.body.password;
  let fName = req.body.fName;
  let age = req.body.age;
  let mNumber = req.body.mNumber;
  let gender = req.body.gender;
  let type = req.body.type;
  let location = req.body.location;
  let description = req.body.description;
  let hospital = req.body.hospital;
  //real code starts
  try {
    const salt = await bcrypt.genSalt(10);
    password = await bcrypt.hash(password, salt);
    let user = await Doctor.findOne({ where: { email: email } });
    if (user) {
      return res.status(410).json({ status: false, code: 101 });
    } else {
      user = await Doctor.create({
        id: id,
        email: email,
        password: password,
        fName: fName,
        age: parseInt(age),
        gender: gender,
        type: type,
        location: location,
        description: description,
        hospital: hospital,
        mNumber: mNumber,
      });
      return res
        .status(200)
        .json({ status: true, message: "Doc created successfully", code: 1 });
    }
  } catch (err) {
    console.log("Error in Signup module occured", err);
    res.status(200).json({ status: false, err });
  }
});

app.post("/doc-login", async (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  let user = await Doctor.findOne({ where: { email: email } });

  if (!user) {
    return res
      .status(410)
      .json({ status: false, error: "User dont exists ", code: 110 });
  } else {
    await bcrypt.compare(password, user.password).then((result) => {
      if (result === true) {
        dotenv.config();

        const payLoadData = {
          id: user.id,
        };
        dotenv.config();
        const token = jwt.sign(payLoadData, process.env.KEY);

        return res
          .status(200)
          .json({ status: true, token: token, code: 2, id: user.id });
      } else {
        return res
          .status(410)
          .json({ status: false, error: "Wrong password", code: 102 });
      }
    });
  }
});

app.get("/get-doc-des-from-id", (req, res) => {
  Doctor.findOne({
    where: {
      id: req.headers.id,
    },
  })
    .then((data) => {
      res.status(200).json({ data });
    })
    .catch((err) => {
      res.status(200).json({ err });
    });
});

app.get("/get-appointments-doc", (req, res) => {
  Appointment.findAll({
    where: {
      doctorId: req.headers.doctor,
    },
  })
    .then((data) => {
      res.status(200).json({ data });
    })
    .catch((err) => {
      res.status(200).json({ err });
    });
});
app.post("/approve-appointment", (req, res) => {
  const app = Appointment.update(
    { status: "Approved", remarks: "Approve by the doc" },
    { where: { id: req.body.id, doctorId: req.body.doctorId } }
  )
    .then((data) => {
      let userId = req.body.userId;
      let doctorId = req.body.doctorId;
      let time = req.body.time;
      let date = req.body.date;

      //
      // Doctor.findOne({
      //   where: {
      //     id: doctorId,
      //   },
      // })
      //   .then((data) => {
      //     client.messages
      //       .create({
      //         body: `Best wishes doctor, appointment request for ${date} ( ${time} ) has been approved`,
      //         to: `+91${data.mNumber}`, // Text this number
      //         from: "+15075797269", // From a valid Twilio number
      //       })
      //       .then((message) => console.log(message.sid));

      //     console.log({ toDoc: data.mNumber });
      //   })
      //   .catch((err) => {
      //     console.log({ err });
      //   });
      User.findOne({
        where: {
          id: userId,
        },
      })
        .then((data) => {
          client.messages
            .create({
              body: `Best wishes , appointment request for ${date} ( ${time} )  has been approved.`,
              to: `+91${data.mNumber}`, // Text this number
              from: "+15075797269", // From a valid Twilio number
            })
            .then((message) => console.log(message.sid));
          console.log({ toUser: data.mNumber });
        })
        .catch((err) => {
          console.log({ err });
        });

      //
      res.status(200).json({ data });
    })
    .catch((err) => {
      res.status(200).json({ err });
    });
});
app.post("/cancel-appointment-doc", async (req, res) => {
  let date = req.body.date;
  let time = req.body.time;
  Appointment.update(
    { status: "Canceled", remarks: "Canceled by doctor" },
    { where: { id: req.body.id, doctorId: req.body.doctorId } }
  )
    .then((data) => {
      res.status(200).json({ data });

      //
      // Doctor.findOne({
      //   where: {
      //     id: req.body.doctorId,
      //   },
      // })
      //   .then((data) => {
      //     client.messages
      //       .create({
      //         body: `Best wishes doctor, appointment request for ${date} ( ${time} ) has been canceled `,
      //         to: `+91${data.mNumber}`, // Text this number
      //         from: "+15075797269", // From a valid Twilio number
      //       })
      //       .then((message) => console.log(message.sid));

      //     console.log({ toDoc: data.mNumber });
      //   })
      //   .catch((err) => {
      //     console.log({ err });
      //   });
      User.findOne({
        where: {
          id: req.body.userId,
        },
      })
        .then((data) => {
          client.messages
            .create({
              body: `Best wishes , Doctor has canceled the appointment request for ${date} ( ${time} ) `,
              to: `+91${data.mNumber}`, // Text this number
              from: "+15075797269", // From a valid Twilio number
            })
            .then((message) => console.log(message.sid));
          console.log({ toUser: data.mNumber });
        })
        .catch((err) => {
          console.log({ err });
        });

      //
    })
    .catch((err) => {
      res.status(200).json({ err });
    });
});

app.get("/get-notification-doc", (req, res) => {
  Appointment.findAll({
    where: {
      [Op.and]: [{ doctorId: req.headers.doctor }, { seenD: "N" }],
    },
  })
    .then((data) => {
      res.status(200).json({ data });
    })
    .catch((err) => {
      res.status(200).json({ err });
    });
});
app.patch("/set-notification-doc", (req, res) => {
  Appointment.update(
    { seenD: "Y" },
    {
      where: {
        [Op.and]: [{ doctorId: req.headers.doctor }, { seenD: "N" }],
      },
    }
  )
    .then((data) => {
      res.status(200).json({ data });
    })
    .catch((err) => {
      res.status(200).json({ err });
    });
});
//  {where : { [Op.and] :[
//  , {type : type}}]
// }}

app.post("/find-doc-key", auth, (req, res) => {
  if (req.headers.user !== req.userId)
    return res.status(401).json({ succes: false });
  let search = req.body.search;
  let type = req.body.type;
  Doctor.findAll({
    where: {
      [Op.and]: [{ fName: { [Op.like]: `%${search}%` } }, { type: type }],
    },
  })
    .then((data) => {
      res.status(200).json({ data });
    })
    .catch((err) => {
      console.log(err);
      res.status(200).json({ err });
    });
});

app.patch("/comp-appointment", (req, res) => {
  let id = req.body.id;
  let doctorId = req.body.docId;
  let earning = req.body.earning;
  Appointment.update(
    {
      status: "Completed",
      remarks: req.body.remarks,
      charged: parseInt(earning),
    },
    {
      where: {
        id: id,
        doctorId: doctorId,
        status: "Approved",
      },
    }
  )
    .then((data) => {
      res.status(200).json({ success: true });
    })
    .catch((err) => {
      res.status(200).json({ success: false });
    });
});

app.get("/doc-earning-total", (req, res) => {
  let doctorId = req.headers.docid;
  sequelize
    .query(
      `SELECT SUM(charged) AS sum FROM appointments WHERE doctorId = ?  `,
      {
        replacements: [doctorId],
        type: QueryTypes.SELECT,
      }
    )
    .then((data) => {
      res.status(200).json({ data });
    })
    .catch((err) => {
      res.status(200).json({ err });
    });
});

app.get("/doc-earning-month", (req, res) => {
  let doctorId = req.headers.docid;
  const date = new Date();
  sequelize
    .query(
      `SELECT SUM(charged) as sum FROM appointments WHERE doctorId = ? AND date LIKE ? `,
      {
        replacements: [
          doctorId,
          `${date.getFullYear()}-${
            (date.getMonth() + 1).toString().length == 1
              ? "0" + (date.getMonth() + 1).toString()
              : (date.getMonth() + 1).toString()
          }%`,
        ],
        type: QueryTypes.SELECT,
      }
    )
    .then((data) => {
      res.status(200).json({ data });
    })
    .catch((err) => {
      res.status(200).json({ err });
    });
});

module.exports = app;
