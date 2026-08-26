/**
 * Menu de respaldo para Truman Bar & Kitchen.
 *
 * Se usa cuando Sanity no tiene datos publicados todavia. Los precios son
 * inventados; la estructura y los productos estan basados en las cartas 2026.
 */

export interface TrumanDish {
  _id: string;
  name: string;
  description?: string;
  price: number;
  tags?: string[];
}

export interface TrumanCategory {
  _id: string;
  title: string;
  description?: string;
  items: TrumanDish[];
}

export const TRUMAN_CURRENCY = 'ARS';

export const TRUMAN_NAME = 'Truman';
export const TRUMAN_TAGLINE = 'Bar & Kitchen';

export const TRUMAN_CONTACT = {
  instagram: 'trumanbarkitchen',
  whatsapp: '5491112345678',
  address: 'Av. del Libertador 1234, CABA',
};

export const TRUMAN_HOURS = [
  { days: 'Lunes a Viernes', hours: '08:00 - 00:00' },
  { days: 'Sabados y Domingos', hours: '09:00 - 01:00' },
];

export const TRUMAN_MENU: TrumanCategory[] = [
  {
    _id: 'desayunos',
    title: 'Desayunos',
    description: 'Todos incluyen infusion.',
    items: [
      { _id: 'd1', name: 'Croissant con Jamon y Queso', description: 'Croissant mantecoso con jamon cocido y queso tybo.', price: 8500 },
      { _id: 'd2', name: 'Tostado de Miga', description: 'Jamon, queso y tomate. Opcion de palta +$1500.', price: 7900 },
      { _id: 'd3', name: 'Yogur con Frutas', description: 'Yogur natural, granola, frutos rojos y miel.', price: 7200, tags: ['vegetariano'] },
      { _id: 'd4', name: 'Waffle Dulce', description: 'Con crema, frutos rojos y maple.', price: 8900 },
      { _id: 'd5', name: 'Huevos Revueltos', description: 'Con tostadas de campo y palta.', price: 9200, tags: ['vegetariano'] },
    ],
  },
  {
    _id: 'cafeteria',
    title: 'Cafeteria',
    items: [
      { _id: 'c1', name: 'Espresso', description: 'Cafe doble, intenso y cremoso.', price: 3200 },
      { _id: 'c2', name: 'Cortado', description: 'Cafe con leche texturizada.', price: 3600 },
      { _id: 'c3', name: 'Flat White', description: 'Doble espresso con microespuma.', price: 4100 },
      { _id: 'c4', name: 'Latte', description: 'Espresso con leche vaporizada.', price: 4100 },
      { _id: 'c5', name: 'Cappuccino', description: 'Espresso, leche y espuma de leche con cacao.', price: 4100 },
      { _id: 'c6', name: 'Americano', description: 'Cafe largo suave.', price: 3400 },
      { _id: 'c7', name: 'Irish Coffee', description: 'Cafe, whisky y crema.', price: 6900 },
    ],
  },
  {
    _id: 'frappes',
    title: 'Frappes',
    items: [
      { _id: 'f1', name: 'Smoothie Proteico', description: 'Proteina de vainilla, arandanos, chia, datiles de Egipto, yogur griego y canela.', price: 8500 },
      { _id: 'f2', name: 'Strawberry Matcha', description: 'Reduccion de frutos rojos, leche, matcha y hielo.', price: 7900 },
      { _id: 'f3', name: 'Dubai', description: 'Syrup de pistacho, leche, cafe y hielo. Topping: crema y pistacho caramelizado.', price: 8200 },
      { _id: 'f4', name: 'Caramel Crunch', description: 'Syrup de caramelo, leche, cafe y hielo. Topping: crema, salsa de caramelo y crocante de mani.', price: 8200 },
      { _id: 'f5', name: 'Mocca Argento', description: 'Chocolate, dulce de leche, cafe y hielo. Toppings: crema, salsa de chocolate y dulce de leche.', price: 8200 },
      { _id: 'f6', name: 'Cookies & Creme', description: 'Oreo, helado de americana, leche y hielo. Topping: crema, oreos y salsa de chocolate.', price: 7900 },
    ],
  },
  {
    _id: 'jugos',
    title: 'Jugos y Limonadas',
    items: [
      { _id: 'j1', name: 'Verde Detox', description: 'Menta, manzana verde, jugo de limon, kiwi, espinaca y pepino.', price: 6500 },
      { _id: 'j2', name: 'Naranja Energy', description: 'Zanahoria, manzana roja, jugo de naranja, miel y menta.', price: 6500 },
      { _id: 'j3', name: 'Limonada', description: 'Menta y jengibre 500 ml / 1 L.', price: 5500 },
      { _id: 'j4', name: 'Jugo de Naranja', description: 'Exprimido natural.', price: 4800 },
      { _id: 'j5', name: 'Licuado de Frutas', description: 'Con leche o agua.', price: 5900 },
    ],
  },
  {
    _id: 'bakery',
    title: 'Bakery',
    items: [
      { _id: 'b1', name: 'Medialuna de Manteca', price: 1800 },
      { _id: 'b2', name: 'Medialuna de Jamon y Queso', price: 2400 },
      { _id: 'b3', name: 'Tortillas', description: 'Pack x3.', price: 2200 },
      { _id: 'b4', name: 'Croissant', price: 2500 },
      { _id: 'b5', name: 'Roll de Canela', price: 3200 },
      { _id: 'b6', name: 'Budin de Limon', price: 4500 },
      { _id: 'b7', name: 'Budin de Chocolate', price: 4500 },
      { _id: 'b8', name: 'Budin de Zanahoria', price: 4500 },
      { _id: 'b9', name: 'Budin de Frutos Rojos', price: 4500 },
      { _id: 'b10', name: 'Porcion de Torta', description: 'Consultar variedad del dia.', price: 5800 },
      { _id: 'b11', name: 'Alfajor de Maicena', price: 2200 },
      { _id: 'b12', name: 'Alfajor de Chocolate', price: 2400 },
      { _id: 'b13', name: 'Alfajor de Nuez y DDL', price: 2600 },
      { _id: 'b14', name: 'Tiramisu', price: 6500 },
      { _id: 'b15', name: 'Mousse de Chocolate', price: 5900 },
      { _id: 'b16', name: 'Cheesecake de Dulce de Leche', description: 'O frutos rojos.', price: 6200 },
    ],
  },
  {
    _id: 'entradas',
    title: 'Entradas',
    items: [
      { _id: 'e1', name: 'Brusquetas de Hummus', description: 'Hummus de garbanzo, tomate cherry y pesto.', price: 7900, tags: ['vegan'] },
      { _id: 'e2', name: 'Rabas', description: 'Con limon y salsa tartara.', price: 11900 },
      { _id: 'e3', name: 'Tacos de Pollo', description: 'Tres tacos con guacamole y pico de gallo.', price: 9800 },
    ],
  },
  {
    _id: 'livianas',
    title: 'Livianas',
    items: [
      { _id: 'l1', name: 'Ensalada Cesar', description: 'Pollo grillado, croutons, queso parmesano y aderezo cesar.', price: 10500 },
      { _id: 'l2', name: 'Ensalada de Rucula', description: 'Rucula, tomates secos, parmesano y balsamico.', price: 8900, tags: ['vegetariano'] },
      { _id: 'l3', name: 'Quiche de Verduras', description: 'Del dia, con mix de verduras de estacion.', price: 8500, tags: ['vegetariano'] },
    ],
  },
  {
    _id: 'sandwiches',
    title: 'Sandwiches',
    items: [
      { _id: 's1', name: 'Bagel de Salmon', description: 'Salmon ahumado, queso crema, alcaparras y rucula.', price: 12500 },
      { _id: 's2', name: 'Sandwich de Pollo', description: 'Pechuga grillada, lechuga, tomate y mayonesa de hierbas.', price: 9900 },
      { _id: 's3', name: 'Veggie Sandwich', description: 'Palta, hummus, zanahoria, pepino y brotes.', price: 9200, tags: ['vegan'] },
    ],
  },
  {
    _id: 'pizzas',
    title: 'Pizzas',
    items: [
      { _id: 'p1', name: 'Margherita', description: 'Salsa de tomate, mozzarella y albahaca.', price: 11500, tags: ['vegetariano'] },
      { _id: 'p2', name: 'Pepperoni', description: 'Salsa de tomate, mozzarella y pepperoni.', price: 13200 },
      { _id: 'p3', name: 'Fugazzeta', description: 'Cebolla, mozzarella y aceite de oliva.', price: 12500, tags: ['vegetariano'] },
      { _id: 'p4', name: 'Cuatro Quesos', description: 'Mozzarella, roquefort, parmesano y fontina.', price: 13800, tags: ['vegetariano'] },
    ],
  },
  {
    _id: 'pastas',
    title: 'Pastas',
    items: [
      { _id: 'pa1', name: 'Fettuccine Alfredo', description: 'Crema, parmesano y nuez moscada.', price: 11800, tags: ['vegetariano'] },
      { _id: 'pa2', name: 'Ravioles de Ricota', description: 'Salsa fileto o crema.', price: 12400, tags: ['vegetariano'] },
      { _id: 'pa3', name: 'Spaghetti Bolognesa', description: 'Salsa de carne y hierbas.', price: 12900 },
    ],
  },
  {
    _id: 'principales',
    title: 'Principales',
    items: [
      { _id: 'pr1', name: 'Burger Truman', description: 'Carne 180 g, cheddar, panceta, cebolla caramelizada y huevo.', price: 14500 },
      { _id: 'pr2', name: 'Milanesa de Peceto', description: 'Con pure rustico o ensalada.', price: 13900 },
      { _id: 'pr3', name: 'Pollo al Curry', description: 'Con arroz basmati y vegetales.', price: 13500 },
      { _id: 'pr4', name: 'Risotto de Hongos', description: 'Arborio, hongos de estacion y parmesano.', price: 13200, tags: ['vegetariano'] },
    ],
  },
  {
    _id: 'guarniciones',
    title: 'Guarniciones',
    items: [
      { _id: 'g1', name: 'Papas Fritas', price: 5500 },
      { _id: 'g2', name: 'Pure Rustico', price: 4800 },
      { _id: 'g3', name: 'Ensalada Mixta', price: 4500 },
      { _id: 'g4', name: 'Verduras Grilladas', price: 5200, tags: ['vegan'] },
    ],
  },
  {
    _id: 'postres',
    title: 'Postres',
    items: [
      { _id: 'po1', name: 'Flan Casero', description: 'Con dulce de leche y crema.', price: 5500 },
      { _id: 'po2', name: 'Chocotorta', price: 5900 },
      { _id: 'po3', name: 'Helado Artesanal', description: 'Dos bochas.', price: 5200 },
    ],
  },
  {
    _id: 'cervezas',
    title: 'Cervezas',
    items: [
      { _id: 'ce1', name: 'Pinta de Cerveza Artesanal', description: 'Rubia o roja.', price: 6200 },
      { _id: 'ce2', name: 'Cerveza Importada', price: 7000 },
      { _id: 'ce3', name: 'Cerveza sin Alcohol', price: 5800 },
    ],
  },
  {
    _id: 'bebidas',
    title: 'Bebidas sin alcohol',
    items: [
      { _id: 'be1', name: 'Agua con o sin Gas', price: 2500 },
      { _id: 'be2', name: 'Gaseosa', price: 3200 },
      { _id: 'be3', name: 'Tonica', price: 3500 },
    ],
  },
  {
    _id: 'vinos',
    title: 'Vinos',
    items: [
      { _id: 'v1', name: 'Alamos Malbec', description: 'Bodega Catena Zapata.', price: 18500 },
      { _id: 'v2', name: 'Rutini Cabernet Malbec', description: 'Bodega Rutini Wines.', price: 28000 },
      { _id: 'v3', name: 'Salentein Reserve Chardonnay', description: 'Valle de Uco.', price: 22000 },
      { _id: 'v4', name: 'La Rural Blend', description: 'Corte de malbec y cabernet.', price: 17500 },
      { _id: 'v5', name: 'Aleanna El Enemigo', description: 'Blend de autor.', price: 32000 },
    ],
  },
  {
    _id: 'cocktails',
    title: 'Cocktails',
    items: [
      { _id: 'co1', name: 'Negroni', description: 'Gin, campari y vermut rojo.', price: 9500 },
      { _id: 'co2', name: 'Old Fashioned', description: 'Bourbon, azucar y bitters.', price: 9800 },
      { _id: 'co3', name: 'Margarita', description: 'Tequila, triple sec y jugo de limon.', price: 9200 },
      { _id: 'co4', name: 'Aperol Spritz', description: 'Aperol, prosecco y soda.', price: 8900 },
      { _id: 'co5', name: 'Gin Tonic', description: 'Gin, tonica y twist de lima.', price: 8500 },
    ],
  },
];
