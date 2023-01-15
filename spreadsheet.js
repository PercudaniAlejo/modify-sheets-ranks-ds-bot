const { GoogleSpreadsheet } = require('google-spreadsheet');
const credentials = require('./json/credentials.json');

require("dotenv").config();

let googleSheetId = process.env.SHEETS_ID; 

// HACER METODOS DE DELETE UPDATE ADD QUE SE LLAMAN EN APP.JS
async function loginGoogleSuite() {
    const document = new GoogleSpreadsheet(googleSheetId);
    await document.useServiceAccountAuth(credentials);
    await document.loadInfo();
    const sheet = document.sheetsByIndex[0];

    const data = await sheet.getRows();
    // console.log(data); 
}

loginGoogleSuite();

module.exports = {
    loginGoogleSuite
}


