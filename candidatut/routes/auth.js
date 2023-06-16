function auth(types) {
    return (req, res, next) => {
        if(!req.session.user) {
            res.redirect('/home');
        } else if (types && !types.includes(req.session.user.type)) {
            res.status(403).send("Not authorized");
        } else {
            next();
        }
    }
}

module.exports = auth;