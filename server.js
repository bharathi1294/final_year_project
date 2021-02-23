const http = require("http")
const { parse } = require('querystring')

var string = `
            <!doctype html>
            <html>
            <body>
            <form action='/display' method='POST'>
                <label>First Name:</label>
                <input type="text" name="fname"><br>
                <label>Last Name:</label>
                <input type="text" name="lname"><br>
                <label>Phone Number:</label>
                <input type="text" name="mob"><br>
                <button>Submit</button>
            </form>
            </body>
            </html>
        `
        
const server = http.createServer((req, res) => {

        if (req.method === 'POST' && req.url == '/display') {
                let body = '';
                req.on('data', chunk => {
                    body += chunk.toString();
                });
                req.on('end', () => {
                    result = parse(body)
                    var r_html = `
                        <!doctype html>
                        <html>
                        <body>
                        <h3>First Name:`+ result.fname + `</h3>
                        <h3>Last Name:`+ result.lname + `</h3>
                        <h3>Phone Number:`+ result.mob + `</h3>
                        </body>
                        </html>`
                    res.end(r_html)
                });
            } 
        else {
                res.end(string);
            }
        });

server.listen(3000);
        