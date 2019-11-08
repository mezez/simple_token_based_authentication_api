// class User{
//     let user = [];

//     addUSer = (userObject) => {
//         this.user.push(userObject);
//     }
// }

let userArray = [];
let articleArray = [];

exports.user = (req, res, next) => {
    if (req.body.isEmpty()) {
        return res.status(400);
    } else {
        const userId = req.body.user_id;
        const login = req.body.login;
        const password = req.body.password;

        const userObject = { userId: userId, login: login, password: password };
        userArray.push(userObject);
        return res.status(201);
    }


};

exports.authenticate =  (req, res, next) => {
    if (req.body.isEmpty()) {
        return res.status(400);
    } else {
        //assume there is jwt in the app

        const login = req.body.login;
        const password = req.body.password;
    

        const user = userArray.find(user => { return  (user.login === login && user.password === password); });
        if (!user) {
            return res.status(404);
        }

        //user is found, generate token
        const token = jwt.sign(
            {
                userId: user.userId,

            },
            "someSecret",
            { expiresIn: '1h' }
        );
        return res.status(200).json({ token: token });

    }
}

exports.logout = (req, res, next) => {
    if (req.body.isEmpty()) {
        return res.status(400);
    } else {
        //assume there is jwt in the app
        const authHeader = req.get('Authorization');

        const token = authHeader;
        let decodedToken
        try {
            decodedToken = jwt.verify(token, 'someSecret');
        } catch (err) {
            return res.status(500);
        }
        if (decodedToken) {
            jwt.destroy(); //whatever, verify
        }

    }
};

exports.articles = (req, res, next) => {
    if (req.body.isEmpty()) {
        return res.status(400);
    } else {
        //assume there is jwt in the app
        const authHeader = req.get('Authorization');

        const token = authHeader;
        let decodedToken
        try {
            decodedToken = jwt.verify(token, 'someSecret');
        } catch (err) {
            return res.status(500);
        }
        if (!decodedToken) {
            return res.status(401);
        }

        //valid token
        const articleId = req.body.article_id;
        const title = req.body.title;
        const content = req.body.content;
        const visbility = req.body.visbility;

        const article = { articleId: articleId, title: title, content: content, visbility: visbility , userId: decodedToken.userId};
        articleArray.push(article);
        return res.status(201);
    }
}

exports.articles = (req, res, next) => {
    const authHeader = req.get('Authorization');

    const token = authHeader;
    let decodedToken
    try {
        decodedToken = jwt.verify(token, 'someSecret');
    } catch (err) {
        return res.status(500);
    }
    if (!decodedToken) {
        //public articles
        const articles = articleArray.filter(articleObject => {
            return articleObject === "public";
        });
        return res.status(200).json({articles: articles});
    
    }
    if(decodedToken){
        //return valid articles
        //public articles
        const publicArticles = articleArray.filter(articleObject => {
            return articleObject === "public";
        });
        const visbibleArticles = articleArray.filter(articleObject => {
            return articleObject.visbility === "logged_in"; 
        });
        //assume lodash is installed
        const senderArticles = _filter(articleArray, {userId: decodedToken.userId});

        return res.status(200).json({
            publicArticles: publicArticles,
            visbibleArticles: visbibleArticles,
            senderArticles:senderArticles 
        });
    }

}