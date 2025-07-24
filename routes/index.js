var express = require('express');
var router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const products = {
  tshirt: { name: 'Demo T-Shirt', price: 1999, image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80' },
  mug: { name: 'Demo Mug', price: 999, image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80' },
  stickers: { name: 'Demo Sticker Pack', price: 499, image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80' }
};

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Home' });
});

/* GET about page. */
router.get('/about', function(req, res, next) {
  res.render('about', { title: 'About' });
});

/* GET contact page. */
router.get('/contact', function(req, res, next) {
  res.render('contact', { title: 'Contact Us' });
});

/* GET product page. */
router.get('/products', function(req, res, next) {
  res.render('products', { title: 'Products' });
});

/* GET cart page. */
router.get('/cart', function(req, res, next) {
  res.render('cart', { title: 'Cart' });
});

/* GET checkout page. */
router.get('/checkout', async (req, res) => {
  const itemKey = req.query.item;
  const product = products[itemKey];
  if (!product) return res.status(400).send('Invalid product');
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'cad',
            product_data: {
              name: product.name,
              images: [product.image]
            },
            unit_amount: product.price
          },
          quantity: 1
        }
      ],
      success_url: `${req.protocol}://${req.get('host')}/success`,
      cancel_url: `${req.protocol}://${req.get('host')}/cancel`
    });
    res.redirect(session.url);
  } catch (err) {
    res.status(500).send('Stripe error: ' + err.message);
  }
});

module.exports = router;
