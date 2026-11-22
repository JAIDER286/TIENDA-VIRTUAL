// ============================================================
// data.js - Respaldo local: 20 prendas de tiendas colombianas
// ============================================================

const CATEGORIES = ['Todos', 'Chaquetas', 'Camisetas', 'Pantalones', 'Buzos', 'Sacos'];

const STORES = ['KOAJ', 'Arturo Calle', 'Mattelsa', 'Tennis', 'Gef', 'Seven Seven'];

// Generador de imágenes SVG neón (respaldo si falla la imagen real)
function makeImage(label, icon, color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#070b14"/>
        <stop offset="1" stop-color="#1a1f3a"/>
      </linearGradient>
      <filter id="gl"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    </defs>
    <rect width="400" height="300" fill="url(#g)"/>
    <circle cx="200" cy="120" r="70" fill="none" stroke="${color}" stroke-width="2" filter="url(#gl)" opacity="0.6"/>
    <text x="200" y="142" text-anchor="middle" font-size="58" fill="${color}" filter="url(#gl)">${icon}</text>
    <text x="200" y="235" text-anchor="middle" font-family="monospace" font-size="15" fill="#e6f1ff">${label}</text>
    <text x="200" y="260" text-anchor="middle" font-family="monospace" font-size="11" fill="${color}">TIENDAS COLOMBIANAS</text>
  </svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// Fotos reales (Unsplash) - 20 imágenes funcionales de prendas
const IMG = (id) => `https://images.unsplash.com/photo-${id}?w=400&h=300&fit=crop`;

const fallbackProducts = [
  // ---------- CHAQUETAS (4) ----------
  { id: 1, name: 'Chaqueta Denim Oversize', category: 'Chaquetas', brand: 'KOAJ', price: 189900, stock: 12, image: IMG('1521572163474-6864f9cf17ab'), desc: 'Chaqueta denim de corte oversize con lavado vintage y bolsillos frontales.', features: ['Material: 100% algodón denim', 'Tallas: S-XL', 'Corte: oversize', 'Lavado vintage', 'Cuidado: lavar a 30°'] },
  { id: 2, name: 'Chaqueta Cuero Sintético', category: 'Chaquetas', brand: 'Arturo Calle', price: 259900, stock: 8, image: IMG('1542272604-787c3835535d'), desc: 'Chaqueta de cuero sintético con cierre frontal y forro interior suave.', features: ['Material: cuero sintético', 'Tallas: S-XXL', 'Corte: regular', 'Forro interior', 'Cuidado: limpieza en seco'] },
  { id: 3, name: 'Chaqueta Rompevientos', category: 'Chaquetas', brand: 'Mattelsa', price: 149900, stock: 15, image: IMG('1591047139829-d91aecb6caea'), desc: 'Rompevientos ligero e impermeable con capucha ajustable.', features: ['Material: poliéster', 'Tallas: S-XL', 'Corte: regular', 'Impermeable', 'Cuidado: lavar a 30°'] },
  { id: 4, name: 'Chaqueta Jean Clásica', category: 'Chaquetas', brand: 'Tennis', price: 179900, stock: 10, image: IMG('1618354691373-d851c5c3a990'), desc: 'Chaqueta jean clásica con botones metálicos y costuras reforzadas.', features: ['Material: denim', 'Tallas: S-XXL', 'Corte: regular', 'Botones metálicos', 'Cuidado: lavar a 30°'] },

  // ---------- CAMISETAS (4) ----------
  { id: 5, name: 'Camiseta Oversize Algodón', category: 'Camisetas', brand: 'Seven Seven', price: 79900, stock: 25, image: IMG('1556821840-3a63f95609a7'), desc: 'Camiseta oversize de algodón premium con caída relajada.', features: ['Material: 100% algodón', 'Tallas: S-XL', 'Corte: oversize', 'Cuello redondo', 'Cuidado: lavar a 30°'] },
  { id: 6, name: 'Camiseta Gráfica Urbana', category: 'Camisetas', brand: 'KOAJ', price: 69900, stock: 30, image: IMG('1603252109303-2751441dd157'), desc: 'Camiseta con estampa gráfica de inspiración urbana.', features: ['Material: algodón', 'Tallas: S-XXL', 'Corte: regular', 'Estampa gráfica', 'Cuidado: lavar a 30°'] },
  { id: 7, name: 'Camiseta Básica Premium', category: 'Camisetas', brand: 'Arturo Calle', price: 59900, stock: 40, image: IMG('1583743814966-8936f5b7be1a'), desc: 'Camiseta básica de cuello redondo y algodón peinado.', features: ['Material: algodón peinado', 'Tallas: S-XXL', 'Corte: slim', 'Cuello reforzado', 'Cuidado: lavar a 30°'] },
  { id: 8, name: 'Camiseta Oversize Tie-Dye', category: 'Camisetas', brand: 'Mattelsa', price: 89900, stock: 18, image: IMG('1562157873-818bc0726f68'), desc: 'Camiseta oversize con efecto tie-dye artesanal.', features: ['Material: algodón', 'Tallas: S-XL', 'Corte: oversize', 'Tie-dye', 'Cuidado: lavar a mano'] },

  // ---------- PANTALONES (4) ----------
  { id: 9, name: 'Jean Skinny Azul', category: 'Pantalones', brand: 'Gef', price: 139900, stock: 16, image: IMG('1620799140408-edc6dcb6d633'), desc: 'Jean skinny de tiro alto con elastano para mayor comodidad.', features: ['Material: denim elástico', 'Tallas: 26-34', 'Corte: skinny', 'Tiro alto', 'Cuidado: lavar a 30°'] },
  { id: 10, name: 'Jean Mom Fit', category: 'Pantalones', brand: 'Seven Seven', price: 159900, stock: 14, image: IMG('1576566588028-4147f3842f27'), desc: 'Jean mom fit de tiro alto y pierna relajada.', features: ['Material: denim', 'Tallas: 26-34', 'Corte: mom fit', 'Tiro alto', 'Cuidado: lavar a 30°'] },
  { id: 11, name: 'Pantalón Cargo', category: 'Pantalones', brand: 'KOAJ', price: 119900, stock: 22, image: IMG('1602810318383-e386cc2a3ccf'), desc: 'Pantalón cargo con bolsillos laterales y cintura ajustable.', features: ['Material: algodón ripstop', 'Tallas: 28-36', 'Corte: cargo', 'Bolsillos múltiples', 'Cuidado: lavar a 30°'] },
  { id: 12, name: 'Jean Roto', category: 'Pantalones', brand: 'Arturo Calle', price: 149900, stock: 12, image: IMG('1541099649105-f69ad21f3246'), desc: 'Jean con rotos en rodillas y efecto desgastado.', features: ['Material: denim', 'Tallas: 28-36', 'Corte: slim', 'Efecto desgastado', 'Cuidado: lavar a 30°'] },

  // ---------- BUZOS (4) ----------
  { id: 13, name: 'Buzo Oversize', category: 'Buzos', brand: 'Mattelsa', price: 129900, stock: 18, image: IMG('1503342217505-b0a15ec3261c'), desc: 'Buzo oversize de fleece suave con capucha ajustable.', features: ['Material: fleece', 'Tallas: S-XL', 'Corte: oversize', 'Capucha ajustable', 'Cuidado: lavar a 30°'] },
  { id: 14, name: 'Buzo con Capucha', category: 'Buzos', brand: 'Tennis', price: 139900, stock: 15, image: IMG('1551028719-00167b16eac5'), desc: 'Buzo con capucha y bolsillo canguro, ideal para el día a día.', features: ['Material: algodón', 'Tallas: S-XXL', 'Corte: regular', 'Bolsillo canguro', 'Cuidado: lavar a 30°'] },
  { id: 15, name: 'Buzo Crop', category: 'Buzos', brand: 'Gef', price: 89900, stock: 20, image: IMG('1552374196-1ab2a1c593e8'), desc: 'Buzo crop de corte corto con mangas abullonadas.', features: ['Material: algodón', 'Tallas: S-M', 'Corte: crop', 'Mangas abullonadas', 'Cuidado: lavar a 30°'] },
  { id: 16, name: 'Buzo Canguro', category: 'Buzos', brand: 'Seven Seven', price: 119900, stock: 24, image: IMG('1598033129183-c4f50c736f10'), desc: 'Buzo canguro con forro polar y puños elásticos.', features: ['Material: algodón/poliéster', 'Tallas: S-XL', 'Corte: regular', 'Forro polar', 'Cuidado: lavar a 30°'] },

  // ---------- SACOS (4) ----------
  { id: 17, name: 'Saco Elegante', category: 'Sacos', brand: 'KOAJ', price: 319900, stock: 6, image: IMG('1617137968427-85924c800a22'), desc: 'Saco elegante de corte slim ideal para ocasiones formales.', features: ['Material: poliéster/viscosa', 'Tallas: S-XL', 'Corte: slim', 'Forro interior', 'Cuidado: limpieza en seco'] },
  { id: 18, name: 'Saco de Lana', category: 'Sacos', brand: 'Arturo Calle', price: 289900, stock: 7, image: IMG('1591195853828-11db59a44f6b'), desc: 'Saco de lana con solapas clásicas y botones forrados.', features: ['Material: lana', 'Tallas: S-XXL', 'Corte: regular', 'Solapas clásicas', 'Cuidado: limpieza en seco'] },
  { id: 19, name: 'Saco Blazer', category: 'Sacos', brand: 'Mattelsa', price: 269900, stock: 9, image: IMG('1600185365483-26d7a4cc7519'), desc: 'Blazer estructurado con hombreras y bolsillos con solapa.', features: ['Material: poliéster', 'Tallas: S-XL', 'Corte: estructurado', 'Hombreras', 'Cuidado: limpieza en seco'] },
  { id: 20, name: 'Saco Tejido', category: 'Sacos', brand: 'Tennis', price: 199900, stock: 11, image: IMG('1594938298603-c8148c4dae35'), desc: 'Saco tejido de punto con botones de madera y corte relajado.', features: ['Material: acrílico/lana', 'Tallas: S-XL', 'Corte: relajado', 'Botones de madera', 'Cuidado: lavar a mano'] }
];