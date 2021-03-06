const nodemailer = require("../config/nodemailer.config");
const db = require("../models");
const User = db.User;
const Invitation = db.invitation;
const Business = db.Business;
const Investor = db.Investor;
const FileRequest = db.filerequest;
var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
const UserTypes = db.UserTypes

exports.request_access = async(req,res) => {

const invitationUser = await Invitation.findOne({where: {
    email:req.body.email
}})

if(!invitationUser){

   const token = jwt.sign({ id: Math.random(1000)}, 'secret');  

   nodemailer.sendWaitMail(
     req.body.email
   )

    Invitation.create({
    email: req.body.email,
    token: token,
    })

  nodemailer.sendConfirmationEmail(
    req.body.email,
    token
  );

    res.status(200).json({
    message:
      "Invitation has been sent! Please check your email, in a couple of days.",
    });
}
else{
    res.status(401).json({message: "You have already requested access please wait."})
}

}

exports.request_file_access = async(req,res) => {

  const requestUser = await FileRequest.findOne({where: {
      user_id:req.body.id
  }})
  
  if(!requestUser){
    const token = jwt.sign({ id: req.body.user_id + ' ' + req.body.id}, 'secret');  

   const receiverUser = await User.findOne({where: {
    id: req.body.user_id
  },raw:true})


  const sender = await User.findOne({where: {
    id: req.body.id
  },raw:true})

      FileRequest.create({
      user_id: req.body.id,
      request_user_id: req.body.user_id,
      user_email:  receiverUser.email,
      request_email: sender.email,
      token: token,
      })


    nodemailer.sendFileRequest(
      receiverUser.email,
      sender.name,
      receiverUser.name,
      token,
    );
  
      res.status(200).json({
      message:
        "Invitation has been sent! Please check your email, in a couple of days.",
      });
  }
  else{
      res.status(401).json({message: "You have already requested access please wait."})
  }
  
  }
  


exports.investor_signup = async(req, res) => {
 const invitation = await Invitation.findOne({where: {
      email: req.body.email,
      access: 1
  }});

  if(!invitation){
    return res.status(401).json("You don't have access to the platform");
  }

  else{
  const token = jwt.sign({ email: req.body.email }, 'secret');
  
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    type: "Investor",
    profile_pic: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    password: bcrypt.hashSync(req.body.password, 8),
  });

  const newInvestor = await Investor.create({user_id:user.id});

    return res.status(200).json({"message": "user logged in", "token": token, "user": {...user.dataValues, ...newInvestor.dataValues}});           
  }
  
}

exports.business_signup = async(req, res) => {

    const invitation = await Invitation.findOne({where: {
        email: req.body.email,
        access: 1
    }})

    if(!invitation){
        return res.status(401).json("You don't have access to the platform");
    }

    else{
    const token = await jwt.sign({ email: req.body.email }, 'secret');

    const user = await User.create({
      name: req.body.name,
      email: req.body.email,
      type: "Business",
      profile_pic: "https://thumbs.dreamstime.com/b/dollars-suitcase-business-icon-vector-sign-symbol-isolated-white-background-logo-concept-your-web-mobile-app-design-134169376.jpg",
      password: bcrypt.hashSync(req.body.password, 8),
      confirmationCode: token,
    });

    const newBusiness = await Business.create({user_id:user.id});
   
    return res.status(200).json({"message": "User logged in", "token": token, "user": {...user.dataValues, ...newBusiness.dataValues}});
    }
  }


exports.signin = (req,res) => {


User.findOne({ where : {
    email: req.body.email, 
},raw:true})
.then(dbUser => {
    if (!dbUser) {
        return res.status(500).json({message: "User not found"});
    } else {
        // password hash
        bcrypt.compare(req.body.password, dbUser.password, async(err, compareRes) => {
            if (err) { // error while comparing
                res.status(502).json({message: "Error while checking user password"});
            } else if (compareRes) { // password match
                const token = jwt.sign(dbUser, 'secret', { expiresIn: '1h' });
                const type = dbUser.type;
                
               if(type == 'Investor'){
                 const investor = await Investor.findOne({
                    where: {
                        user_id: dbUser.id
                    },
                    raw:true
                })  
            
                return res.status(200).json({"message": "user logged in", "token": token, "user": {...investor, ...dbUser, id: investor.user_id,user_id: dbUser.id}, "type": type});
               }
               else{
                const bussiness = await Business.findOne({
                    where: {
                        user_id: dbUser.id
                    },
                    raw:true,
                })  

                console.log(bussiness);

               return res.status(200).json({"message": "user logged in", "token": token, "user": {...bussiness, ...dbUser, id: bussiness.user_id,user_id: dbUser.id}, "type": type});
               }
            } else { // password doesnt match
                res.status(401).json({message: "Invalid credentials"});
            };
        });
    };
})
.catch(err => {
    console.log('error', err);
});
}

exports.hasFileAccess = async(req,res,next) => {
const invitation = await FileRequest.findOne({where: {
user_id: req.body.id,
request_user_id: req.body.user_id
},raw:true});

if(!invitation){
res.status(200).send({access: -1})

}
else if(invitation.access == 1){
  res.status(200).send({access: invitation.access});
}
else{
  res.status(200).send({access: 0});
}


}

exports.verifyUser = (req, res, next) => {
  Invitation.findOne({where: {
    token: req.params.confirmationCode,
  }})
    .then((invitation) => {
      console.log(invitation);
      if (!invitation) {
        return res.status(404).send({ message: "User Not found." });
      }
      invitation.access = 1;
      invitation.save((err) => {
        if (err) {
            console.log(err);
          res.status(500).send({ message: err });
          return;
        }
      });
console.log(invitation.email);
      nodemailer.sendRegistrationEmail(
        invitation.email
      );

      res.status(200).send("Brugeren har nu f??et en mail, med link til registration");
    })
    .catch((e) => console.log("error", e));
};

exports.verifyFileAccess = (req, res, next) => {
console.log(req.params.confirmationCode)
FileRequest.findOne({where: {
  token: req.params.confirmationCode,
}})
  .then(async(invitation) => {
    console.log(invitation);
    if (!invitation) {
      return res.status(404).send({ message: "User Not found." });
    }
    invitation.access = 1;
    invitation.save(async(err) => {
      if (err) {
          console.log(err);
        res.status(500).send({ message: err });
        return;
      }
    });

    const receiver = await User.findOne({where:{
      id: invitation.user_id
    },raw:true})

    const sender = await User.findOne({where: {
      id: invitation.request_user_id
    },raw:true})

    console.log(receiver);

    nodemailer.sendAccessConfirmedMail(
     receiver.email,
     receiver.name,
     sender.name,
     sender.id
    );

    res.status(200).send("You can now close this window.");
  })
  .catch((e) => console.log("error", e));
};
