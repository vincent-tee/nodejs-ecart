const db = require('../database');

class Promotion {
    constructor(id, type, description) {
        this.id = id;
        this.type = type;
        this.description = description;
    }

    save() {
        return new Promise((resolve, reject) => {
            db.run(`INSERT INTO promotions (type, description) VALUES (?, ?)`,
                [this.type, this.description],
                function (err) {
                    if (err) return reject(err);
                    resolve(this.lastID);  // Return the ID of the newly inserted promotion
                });
        });
    }

    // ... Other methods for fetching, updating, or deleting promotions ...
}

module.exports = Promotion;
