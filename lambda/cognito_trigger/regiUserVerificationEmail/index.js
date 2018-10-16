const cofirmEmailURL = ''
const userPoolId = 'us-east-1_3vlAXHPCC'

const getConfirmEmailMessage = (userName, confirmationCode) => (`
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            * {
                box-sizing: border-box;
            }
            #header {
                width: 100%;
                height: 50px;
                margin-bottom: 16px;
                background-color: #FBA818;
                font-size: 26px;
                text-align: center
            }
            img {
                display: inline-block;
                height: 28px;
                margin: 11px 0;
            }
            #wrapper {
                max-width: 600px;
                margin: 0 auto;
            }
            p {
                display: block;
                
                width: 100%;
                margin: 8px 0 0 0;
                font-size: 16px;
                color: #444;
                text-align: left;
                line-height: 1.6em;
            }
            #wrapper a#button {
                display: block;
                
                width: 100%;
                padding: 16px 36px;
                margin-top: 16px;
                border-radius: 4px;
                
                text-decoration: none;
                text-align: center;
                font-size: 18px;
                font-weight: bold;
                background-color: #ff5c59;
                color: #fdfdfd;
            }
        </style>
    </head>
    <body>
        <div id="header"><img src="https://coupos.net/img/coupos.png" alt="COUPOS" /></div>
        <div id="wrapper">
            <p>
                COUPOSへご登録いただき、ありがとうございます。
            </p>
            <p>
                ご利用いただくために、メールアドレスを認証していただく必要があります。
            </p>
            <a id="button" href=https://coupos.net/regi/signup/verify?u=${userName}&c=${confirmationCode}>メールアドレスを認証</a>
        </div>
    </body>
    </html>
`)

const getForgotPasswordEmailMessage = (userName, confirmationCode) => (`
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            * {
                box-sizing: border-box;
            }
            #header {
                width: 100%;
                height: 50px;
                margin-bottom: 16px;
                background-color: #FBA818;
                font-size: 26px;
                text-align: center
            }
            img {
                display: inline-block;
                height: 28px;
                margin: 11px 0;
            }
            #wrapper {
                max-width: 600px;
                margin: 0 auto;
            }
            p {
                display: block;
                
                width: 100%;
                margin: 8px 0 0 0;
                font-size: 16px;
                color: #444;
                text-align: left;
                line-height: 1.6em;
            }
            #wrapper a#button {
                display: block;
                
                width: 100%;
                padding: 16px 36px;
                margin-top: 16px;
                border-radius: 4px;
                
                text-decoration: none;
                text-align: center;
                font-size: 18px;
                font-weight: bold;
                background-color: #ff5c59;
                color: #fdfdfd;
            }
        </style>
    </head>
    <body>
        <div id="header"><img src="https://coupos.net/img/coupos.png" alt="COUPOS" /></div>
        <div id="wrapper">
            <p>
                パスワードの再設定がリクエストされました。<br />
                下のボタンから再設定できます。
            </p>
            <a id="button" href=https://coupos.net/regi/resetpassword/?u=${userName}&c=${confirmationCode}>パスワードを再設定</a>
        </div>
    </body>
    </html>
`)

exports.handler = (event, context, callback) => {
    if(event.userPoolId !== userPoolId) {
        callback(null, event)
        return
    }
    
    if(event.triggerSource === 'CustomMessage_SignUp') {
        event.response.emailSubject = "COUPOS メールアドレス認証"
        event.response.emailMessage = getConfirmEmailMessage(event.userName, event.request.codeParameter)
    
        callback(null, event)
        return
    } else if (event.triggerSource === 'CustomMessage_ForgotPassword') {
        event.response.emailSubject = "COUPOS パスワードの再設定"
        event.response.emailMessage = getForgotPasswordEmailMessage(event.userName, event.request.codeParameter)
    
        callback(null, event)
        return
    } else {
        console.log(event.triggerSource)
        callback(null, event)
        return
    }
}