const { GoogleSpreadsheet } = require('google-spreadsheet');
const credentials = require('./json/credentials.json');
const {google} = require('googleapis');

require("dotenv").config();

const auth = new google.auth.GoogleAuth({
        keyFile: './json/credentials.json',
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    })

const _clientGoogle = auth.getClient(); // Se instancia nuevo cliente para auth
const googleSheets = google.sheets({version: "v4", auth: _clientGoogle}) // Se instancia la API de Google Sheets 

let spreadsheetId = process.env.SHEETS_ID; 
let activeSheet;
// HACER METODOS DE DELETE UPDATE ADD QUE SE LLAMAN EN APP.JS
async function loginGoogleSuite() {
    const document = new GoogleSpreadsheet(spreadsheetId);
    await document.useServiceAccountAuth(credentials);
    await document.loadInfo();
    const sheet = document.sheetsByIndex[0];
    activeSheet = sheet;

    const data = await sheet.getRows();
    // console.log(data); 
}

const addNewRow = async function (values, newMember) {
    console.log("Nuevo PFA: " + newMember.nickname)
    const rows = await activeSheet.getRows();
    googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: 'RANGOS',
        valueInputOption: 'USER_ENTERED',
        resource: values
    })
    // const newPFA = await activeSheet.addRow({Rango: 'rango', Nombre: newMember.nickname, 'Discord (ID)': newMember.id}, { insert: false })
    // await activeSheet.addRow([{Rango: 'rango', Nombre: newMember.nickname, 'Discord (ID)': newMember.id}], { insert: true })
    console.log(rows)
}

loginGoogleSuite();

module.exports = {
    loginGoogleSuite,
    addNewRow
}


