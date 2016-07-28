const treasureChest = require('./treasureChestModel.js');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');

module.exports = {

	getTreasureChests: (socket) => {
		treasureChest.find().then((chests) => {
			socket.emit('getTreasureChests', chests);
		})
	},

	updateTreasureState: (location, socket) => {
		var newLocA = location.substring(0, 7);
		var newLocB = location.substring(8, 17);
		var newLoc = String(newLocA) + String(newLocB);

		treasureChest.findOne({ 'location': newLoc }, (err, treasureData) => {
		console.log('boomboomboom',treasureData)
			if (treasureData) {
				socket.emit('updateTreasureState', treasureData);
			} else {
				socket.emit('updateTreasureState', false);
			}
		});
	},
};