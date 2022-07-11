/* Copyright (C) 2022 Sourav KL11.
Licensed under the  GPL-3.0 License;
you may not use this file except in compliance with the License.
Raganork MD - Sourav KL11
*/
const simpleGit = require('simple-git');
const git = simpleGit();
const {Module} = require('../main');
const {MessageType} = require('@adiwajshing/baileys');
const Config = require('../config');
const exec = require('child_process').exec;
const Heroku = require('heroku-client');
const { PassThrough } = require('stream');
const heroku = new Heroku({ token: Config.HEROKU.API_KEY })
const { skbuffer } = require('raganork-bot');
Module({
    pattern: 'update',
    fromMe: true,
    desc: "Updates bot",
    use: 'owner'
}, (async (message, match) => {
     await git.fetch();
    var commits = await git.log(['main' + '..origin/' + 'main']);
    var mss = '';
    if (commits.total === 0) {
    mss = "*No pending updates!*";
    var img = "https://i.imgur.com/POyujnj.jpeg"
    var buttons = [{
        urlButton: {
            displayText: 'ARNOLDYTREFX',
            url: 'https://github.com/ARNOLDYTREFX/raganork-md'
        }
    }];
    } else {
        var changelog = "_Pending updates:_\n\n";
        commits['all'].map(
            (commit) => {
                changelog += `• *${commit.message}* _[${commit.date.substring(0, 10)}]_ \n`
            }
        );
        mss = changelog;
       var img = "https://i.imgur.com/POyujnj.jpeg"
       var buttons = [{
        urlButton: {
            displayText: 'ARNOLDYTREFX',
            url: 'https://github.com/ARNOLDYTREFX/raganork-md'
        }
    },
    {
        quickReplyButton: {
            displayText: 'അപ്ഡേറ്റ് ചെയ്യട്ടെ...?',
            id: 'upd '+message.myjid
        }
    }];
    }
    await message.sendImageTemplate(await skbuffer(img),mss,"Feel free to update!",buttons);
    }));
Module({
    on: 'button',
    fromMe: true
}, (async (message, match) => {
    if (message.button && message.button.startsWith("upd") && message.button.includes(message.myjid)) {
     await git.fetch();
    var commits = await git.log(['main' + '..origin/' + 'main']);
    if (commits.total === 0) {
        return await message.client.sendMessage(message.jid, { text:"_ബോട്ട് പൂർണമായും പുതിയതാണ്_"})

    } else {
        await message.sendReply("_അപ്ഡേറ്റ് Start ചെയ്തു ഒന്ന് wait ചെയ്യണേ ⏫_")

            try {
                var app = await heroku.get('/apps/' + Config.HEROKU.APP_NAME)
            } catch {
                await message.client.sendMessage(message.jid, { text:"*Heroku app name/api key wrong ❗*"})

                await new Promise(r => setTimeout(r, 1000));
            }
            git.fetch('upstream', 'main');
            git.reset('hard', ['FETCH_HEAD']);

            var git_url = app.git_url.replace(
                "https://", "https://api:" + Config.HEROKU.API_KEY + "@"
            )
            
            try {
                await git.addRemote('heroku', git_url);
            } catch {console.log('Deploy error catched. Retrying...')}
            try { await git.push('heroku', 'main'); } catch(e){ 
            if (e.message.includes("concurrent")) return await message.sendReply("Your account has reached in-parallel build limit! Please wait for the other app to finish its deploy ❗"); 
            }
            await message.sendReply("_Update കഴിഞ്ഞു! Restart ചെയ്യുവാ.._")
         }
    }
    }));
Module({pattern: 'updt',use: 'owner', fromMe: true,dontAddCommandList: true, desc: "Updates bot"}, (async (message, match) => {
    await git.fetch();
    var commits = await git.log(['main' + '..origin/' + 'main']);
    if (commits.total === 0) {
        return await message.client.sendMessage(message.jid, { text:"_ബോട്ട് പൂർണമായും പുതിയതാണ്_"})

    } else {
        await message.client.sendMessage(message.jid, { text:"_അപ്ഡേറ്റ് START ചെയ്തു.._"})

            try {
                var app = await heroku.get('/apps/' + Config.HEROKU.APP_NAME)
            } catch {
                await message.client.sendMessage(message.jid, { text:"Heroku information wrong!"})

                await new Promise(r => setTimeout(r, 1000));
            }
            git.fetch('upstream', 'main');
            git.reset('hard', ['FETCH_HEAD']);

            var git_url = app.git_url.replace(
                "https://", "https://api:" + Config.HEROKU.API_KEY + "@"
            )
            
            try {
                await git.addRemote('heroku', git_url);
            } catch { console.log('heroku remote ekli'); }
            await git.push('heroku', 'main');

            await message.client.sendMessage(message.jid, { text:"_അപ്ഡേറ്റ് വിജയകരമായി പൂർത്തിയായി_"})
           await message.client.sendMessage(message.jid, { text:"_Restarting സന്തോഷം ആയില്ലേ 🤓_"})
            }
}));
