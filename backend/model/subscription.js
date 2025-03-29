const mongoose = require("mongoose")
const SubscriptionSchema = new mongoose.Schema({
    status: { 
        type:String
    },
    planId:{ 
        type: String
    },
    planName:{ 
        type: String
    },
    subscriptionId:{ 
        type: String
    },
    features:{ 
        type: Array
    },
    price:{ 
        type: Number
    },
    billingToken:{ 
        type: String
    },
    paymentHistory: {
         type:Array},
    
    acceptedTerms:{ type: Boolean
        
    },
    startDate: { type: Date, default: Date.now },
    expirationDate: { type: Date },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

},
    { timestamps: true }
)

// Add a pre-save hook to set the expiration date to 4 months after the start date
SubscriptionSchema.pre('save', function(next) {
    if (!this.expirationDate) {
      this.expirationDate = new Date(this.startDate);
      this.expirationDate.setMonth(this.expirationDate.getMonth() + 4);
    }
    next();
  });
module.exports = mongoose.model("Subscription", SubscriptionSchema)

