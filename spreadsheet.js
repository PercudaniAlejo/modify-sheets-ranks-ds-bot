const { GoogleSpreadsheet } = require('google-spreadsheet');
const credentials = require('./json/credentials.json');

require("dotenv").config();

let googleSheetId = process.env.SHEETS_ID; 
let activeSheet;
// HACER METODOS DE DELETE UPDATE ADD QUE SE LLAMAN EN APP.JS
async function loginGoogleSuite() {
    const document = new GoogleSpreadsheet(googleSheetId);
    await document.useServiceAccountAuth(credentials);
    await document.loadInfo();
    const sheet = document.sheetsByIndex[0];
    activeSheet = sheet;

    const data = await sheet.getRows();
    // console.log(data); 
}

const addNewRow = async function (newMember) {
    console.log("Nuevo PFA: " + newMember.nickname)
    const rows = await activeSheet.getRows();
    // const newPFA = await activeSheet.addRow({Rango: 'rango', Nombre: newMember.nickname, 'Discord (ID)': newMember.id}, [true, true])
    // await newPFA.save()
    console.log(rows)
}

loginGoogleSuite();

module.exports = {
    loginGoogleSuite,
    addNewRow
}


