var express = require('express');
var router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECERT_KEY);

const products = {
  tshirt: { name: 'T-Shirt', price: '1999', image: '../public/images/stock-shirt.jpg', description: 'High quality cotton t-shirt.' },
  mug: { name: 'Mug', price: '999', image: '../public/images/stock-mug.jpg', description: 'Ceramic mug for your favorite beverage.' },
  stickers: { name: 'Sticker Pack', price: '499', image: '../public/images/stock-stickers.jpg', description: 'Fun stickers for your laptop.' },
  notebook: { name: 'Notebook', price: '799', image: '../public/images/stock-notebook.jpg', description: 'A5 lined notebook.' },
  pen: { name: 'Pen', price: '299', image: '../public/images/stock-pen.jpg', description: 'Smooth writing pen.' },
  hat: { name: 'Baseball Cap', price: '1499', image: '../public/images/stock-hat.jpg', description: 'Classic cotton cap.' },
  bottle: { name: 'Water Bottle', price: '1299', image: '../public/images/stock-bottle.jpg', description: 'Reusable water bottle.' },
  bag: { name: 'Tote Bag', price: '899', image: '../public/images/stock-bag.jpg', description: 'Eco-friendly tote bag.' },
  hoodie: { name: 'Hoodie', price: '2999', image: '../public/images/stock-hoodie.jpg', description: 'Warm and comfy hoodie.' },
  mousepad: { name: 'Mouse Pad', price: '599', image: '../public/images/stock-mousepad.jpg', description: 'Smooth surface mouse pad.' },
};

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Home' });
});

/* GET about page. */
router.get('/about', function (req, res, next) {
  res.render('about', { title: 'About' });
});

/* GET contact page. */
router.get('/contact', function (req, res, next) {
  res.render('contact', { title: 'Contact Us' });
});

/* GET product page. */
router.get('/products', function (req, res, next) {
  res.render('products', { title: 'Products' });
});

/* GET cart page. */
router.get('/cart', function (req, res, next) {
  res.render('cart', { title: 'Cart' });
});

/* GET checkout page. */
router.get('/create-checkout-session', async (req, res) => {
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

/* GET cart checkout */
router.post('/create-cart-session', async (req, res) => {
  const cart = req.body.cart;

  if (!cart || typeof cart !== 'object') {
    return res.status(400).json({ error: 'Cart is invalid or missing' });
  }

  try {
    const line_items = Object.entries(cart).map(([key, quantity]) => {
      const product = products[key];
      if (!product) throw new Error(`Invalid product key: ${key}`);

      return {
        price_data: {
          currency: 'cad',
          product_data: {
            name: product.name,
            description: product.description,
          },
          unit_amount: parseInt(product.price, 10),
        },
        quantity,
      };
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      success_url: `${req.protocol}://${req.get('host')}/success`,
      cancel_url: `${req.protocol}://${req.get('host')}/cancel`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Stripe error (cart):', err.message);
    res.status(500).json({ error: 'Stripe error: ' + err.message });
  }
});

/* GET success page. */
router.get('/success', (req, res) => {
  res.render('success', { title: 'Payment Successful' });
});

/* GET cancel page. */
router.get('/cancel', (req, res) => {
  res.render('cancel', { title: 'Payment Cancelled' });
});

module.exports = router;
