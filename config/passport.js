const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const Admin = require('../model/Admin');

module.exports = function(passport){
    passport.use(
        new LocalStrategy({usernameField: 'username' }, (username, password, done) => {

            //match user
            Admin.findOne({username:username})
            .then(admin => {
                if(!admin){
                    return done(null, false, {message: 'That Username is not registered'});
                }

                //Match password
                bcrypt.compare(password, admin.password, (err, isMatch) =>{
                    if (err) throw err;

                    if(isMatch){
                        return done(null, admin);
                    }
                    else{
                        return done(null, false, {message: 'password incorrect'})
                    }
                })
            })
            .catch(err => console.log(err));
        })
    );

    passport.serializeUser((Admin, done)=> {
        done(null, Admin.id);
    });

    passport.deserializeUser((id, done)=> {
        Admin.findById(id, (err, Admin) => {
            done(err, Admin);
        });
    });
}
