const stripe = require('stripe')('sk_test_51QTu8r04R4jFOf5Yy7kAOKJ0knB1ppnQYseykTSiQSUBAhvT232SOD77wILHeesOwIU0dijj3HxsUVc4DpoR60KW00VOvOjTGF');

stripe.products.create({
  name: 'NetGuardian',
  description: '$20/al mes',
}).then(product => {
  stripe.prices.create({
    unit_amount: 2000,
    currency: 'usd',
    recurring: {
      interval: 'month',
    },
    product: product.id,
  }).then(price => {
    console.log('NetGuardian product id: ' + product.id);
    console.log('NetGuardian subscription price id: ' + price.id);
  });
});

stripe.products.create({
  name: 'CloudWatch360',
  description: '$40/al mes',
}).then(product => {
  stripe.prices.create({
    unit_amount: 4000,
    currency: 'usd',
    recurring: {
      interval: 'month',
    },
    product: product.id,
  }).then(price => {
    console.log('CloudWatch product id: ' + product.id);
    console.log('CloudWatch subscription price id: ' + price.id);
  });
});

stripe.products.create({
  name: 'SafeLink Pro',
  description: '$80/al mes',
}).then(product => {
  stripe.prices.create({
    unit_amount: 8000,
    currency: 'usd',
    recurring: {
      interval: 'month',
    },
    product: product.id,
  }).then(price => {
    console.log('SafeLink product id: ' + product.id);
    console.log('SafeLink subscription price id: ' + price.id);
  });
});
