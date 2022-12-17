import database from "../src/database.js";

function validatePassword (password) {
    const reg_expression = /(?=.*[0-9])(?=.*[!?.:])(?=.*\d)/;
    const validPassword = password.length >= 5 && password.length <= 20 && reg_expression.test(password);
    if (!validPassword&&reg_expression.test(password)) {
        throw new Error("The password needs to be between 5 and 20 characters");
    }
    else if (!reg_expression.test(password)) {
        throw new Error("The password needs to have at least one number and one special character from '!','?',':','.'");
    }
    else {
        return true;
    }
    
}

async function validateEmail (email) {
    const usedEmail = await database.raw(`select * from users where email='${email}'`);
    const validEmail = email.length >= 5 && email.length <= 20 && usedEmail.length == 0;

    if(!validEmail&& usedEmail.length == 0){
        throw new Error("The email needs to be between 5 and 20 characters");
    }
    else if (usedEmail.length != 0) {
        throw new Error("The email is already used!");
    } 
    else {
        return true;
    }
}

export {validateEmail, validatePassword};