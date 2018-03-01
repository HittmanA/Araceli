var Jimp = require("jimp");
const Discord = require('discord.js');
const Command = require("../src/Command");
var cloudinary = require('cloudinary');

class profile extends Command
{

    constructor(client, db) {
        super("profile", {}, "{prefix}profile", "Use {prefix}profile to get your Araceli profile info. Example: {prefix}profile");
        this.client = client;
        this.db = db;
    }

    onLoad() {
        this.log("Loaded!");
        cloudinary.config({
            cloud_name: 'araceli',
            api_key: '',
            api_secret: ''
        });
    }

    execute(message, args, bot) {
        this.db.getUser(message.author.id, function(data){
            var user = data[0];
            Jimp.read(user.displayAvatarURL, function (err, profileImg) {
                var image = new Jimp(300, 300, 0xFFFFFFFF, function (err, image) {
                    // this image is 300 x 300, every pixel is set to 0x00000000
                    profileImg.resize(300/2, 300/2)
                    image.composite( profileImg, 0, 0 );
                    Jimp.loadFont(Jimp.FONT_SANS_16_BLACK).then(function (font) {
                        image.print(font, 300/2, 256/4, user.username);
                        image.print(font, 300/2, 120, "XP: " + user.xp);
                        image.print(font, 300/2, 160, "Money: $" + user.money);
                        image.print(font, 300/2, 200, "Reputation: " + user.reputation);
                        image.getBase64(Jimp.MIME_PNG, function(err, result){
                            cloudinary.uploader.upload(result, function(res) {
                                var embed = new Discord.RichEmbed()
                                .setColor(0x00AE86)
                                //.setDescription(description)
                                .setFooter("Araceli Copyright 2017-2018")
                                .setTimestamp()
                                .setImage(res.secure_url)
                                .setTitle("Your profile info:")
                                .setAuthor("Araceli")
                                message.channel.send({embed});
                            },  {public_id: message.author.id});
                        });
                    });
                });
            });
        })
    }
}

module.exports = profile;
