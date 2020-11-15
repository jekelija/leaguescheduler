const url = 'http://localhost:3000/';

export class ServiceUtils {
    static request(endpoint:string, type:'POST'|'DELETE'|'GET', data:any): Promise<any> {
        const request = new XMLHttpRequest();
        request.open(type, url + endpoint);
        if(type == 'POST') {
            request.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
        }
        return new Promise((resolve, reject) => {
            request.onload = function () {
                if (request.status >= 200 && request.status < 400) {
                    resolve(JSON.parse(request.responseText));
                } else {
                    reject({status:request.status, response:request.responseText});
                }
            };
            request.onerror = function () {
                reject({status:request.status, response:request.responseText});
            };

            request.send(data ? JSON.stringify(data) : undefined);
        });
    }
}