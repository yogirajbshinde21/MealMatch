const Bargain = require('../models/Bargain');

const handleBargainSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected for bargaining:', socket.id);

    // User joins their personal room for bargain updates
    socket.on('join-user-room', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Restaurant/Admin joins their room for incoming bargains
    socket.on('join-restaurant-room', (restaurantId) => {
      socket.join(`restaurant-${restaurantId}`);
      console.log(`Restaurant ${restaurantId} joined their room`);
    });

    // Admin joins admin room for all notifications
    socket.on('join-admin-room', () => {
      socket.join('admin-room');
      console.log(`Admin joined admin room: ${socket.id}`);
    });

    // Handle new bargain creation
    socket.on('new-bargain', async (data) => {
      try {
        const { userId, mealId, proposedPrice, message } = data;
        
        // Create bargain (this could be moved to controller)
        const bargain = new Bargain({
          user: userId,
          meal: mealId,
          originalPrice: data.originalPrice,
          proposedPrice,
          message,
          restaurant: data.restaurantId
        });

        await bargain.save();

        // Populate bargain
        const populatedBargain = await Bargain.findById(bargain._id)
          .populate('user', 'name email')
          .populate('meal', 'name image')
          .populate('restaurant', 'name');

        // Notify restaurant about new bargain
        io.to(`restaurant-${data.restaurantId}`).emit('bargain-received', {
          bargain: populatedBargain,
          message: 'New bargain offer received!'
        });

        // Notify admin about new bargain
        io.to('admin-room').emit('bargain-received', {
          bargain: populatedBargain,
          message: 'New bargain offer received!'
        });

        // Confirm to user
        socket.emit('bargain-created', {
          bargain: populatedBargain,
          message: 'Bargain offer sent successfully!'
        });

      } catch (error) {
        socket.emit('bargain-error', {
          message: 'Failed to create bargain offer',
          error: error.message
        });
      }
    });

    // Handle bargain response from restaurant
    socket.on('bargain-response', async (data) => {
      try {
        const { bargainId, status, counterPrice, message } = data;

        const bargain = await Bargain.findById(bargainId);
        if (!bargain) {
          socket.emit('bargain-error', { message: 'Bargain not found' });
          return;
        }

        // Update bargain
        bargain.status = status;
        if (counterPrice) bargain.counterPrice = counterPrice;
        if (message) bargain.message = message;
        
        await bargain.save();

        // Populate updated bargain
        const updatedBargain = await Bargain.findById(bargain._id)
          .populate('user', 'name email')
          .populate('meal', 'name image')
          .populate('restaurant', 'name');

        // Notify user about response
        io.to(`user-${bargain.user}`).emit('bargain-update', {
          bargain: updatedBargain,
          message: `Your bargain was ${status}!`
        });

        // Confirm to restaurant
        socket.emit('response-sent', {
          bargain: updatedBargain,
          message: 'Response sent successfully!'
        });

      } catch (error) {
        socket.emit('bargain-error', {
          message: 'Failed to send response',
          error: error.message
        });
      }
    });

    // Handle user accepting counter offer
    socket.on('accept-counter', async (data) => {
      try {
        const { bargainId } = data;

        const bargain = await Bargain.findById(bargainId);
        if (!bargain) {
          socket.emit('bargain-error', { message: 'Bargain not found' });
          return;
        }

        bargain.status = 'accepted';
        bargain.proposedPrice = bargain.counterPrice;
        await bargain.save();

        const updatedBargain = await Bargain.findById(bargain._id)
          .populate('user', 'name email')
          .populate('meal', 'name image')
          .populate('restaurant', 'name');

        // Notify restaurant
        io.to(`restaurant-${bargain.restaurant}`).emit('bargain-accepted', {
          bargain: updatedBargain,
          message: 'Counter offer accepted!'
        });

        // Confirm to user
        socket.emit('counter-accepted', {
          bargain: updatedBargain,
          message: 'Counter offer accepted! You can now add to cart.'
        });

      } catch (error) {
        socket.emit('bargain-error', {
          message: 'Failed to accept counter offer',
          error: error.message
        });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected from bargaining:', socket.id);
    });
  });
};

module.exports = handleBargainSocket;
