export interface Category {
  id: string
  name: string
  parentId?: string
  children?: Category[]
}

export const PRODUCT_CATEGORIES: Category[] = [
  {
    id: 'small-electronics',
    name: 'Small Electronics',
    children: [
      {
        id: 'pc-peripherals',
        name: 'PC Peripherals',
        parentId: 'small-electronics',
        children: [
          { id: 'mice', name: 'Mice', parentId: 'pc-peripherals' },
          { id: 'keyboards', name: 'Keyboards', parentId: 'pc-peripherals' },
          { id: 'mousepad', name: 'Mousepad', parentId: 'pc-peripherals' },
          { id: 'switch', name: 'Switch', parentId: 'pc-peripherals' },
          { id: 'docking-station', name: 'Docking Station', parentId: 'pc-peripherals' },
          { id: 'controller', name: 'Controller', parentId: 'pc-peripherals' }
        ]
      },
      {
        id: 'pc-parts',
        name: 'PC Parts',
        parentId: 'small-electronics',
        children: [
          { id: 'cpus', name: 'CPU\'s', parentId: 'pc-parts' },
          { id: 'motherboards', name: 'Motherboards', parentId: 'pc-parts' },
          { id: 'gpus', name: 'GPU\'s', parentId: 'pc-parts' },
          { id: 'ram', name: 'RAM', parentId: 'pc-parts' },
          { id: 'ssd', name: 'SSD', parentId: 'pc-parts' },
          { id: 'psu', name: 'PSU', parentId: 'pc-parts' },
          { id: 'coolers', name: 'Coolers', parentId: 'pc-parts' },
          { id: 'fans', name: 'Fans', parentId: 'pc-parts' },
          { id: 'pc-cases', name: 'PC Cases', parentId: 'pc-parts' },
          { id: 'pc-parts-other', name: 'Other', parentId: 'pc-parts' }
        ]
      },
      {
        id: 'monitors',
        name: 'Monitors',
        parentId: 'small-electronics',
        children: [
          { id: 'monitors-main', name: 'Monitors', parentId: 'monitors' },
          { id: 'monitor-accessories', name: 'Accessories', parentId: 'monitors' },
          { id: 'monitor-stand', name: 'Stand', parentId: 'monitors' }
        ]
      },
      {
        id: 'laptops',
        name: 'Laptops',
        parentId: 'small-electronics',
        children: [
          { id: 'laptops-main', name: 'Laptops', parentId: 'laptops' },
          { id: 'laptop-accessories', name: 'Laptop Accessories', parentId: 'laptops' },
          { id: 'hard-drive', name: 'Hard Drive', parentId: 'laptops' }
        ]
      },
      {
        id: 'tablets',
        name: 'Tablets',
        parentId: 'small-electronics',
        children: [
          { id: 'tablets-main', name: 'Tablets', parentId: 'tablets' },
          { id: 'tablet-case', name: 'Tablet Case', parentId: 'tablets' },
          { id: 'smart-pen', name: 'Smart Pen', parentId: 'tablets' }
        ]
      },
      {
        id: 'mobile-phones',
        name: 'Mobile Phones',
        parentId: 'small-electronics',
        children: [
          { id: 'mobile-phones-main', name: 'Mobile Phones', parentId: 'mobile-phones' },
          { id: 'phone-case', name: 'Phone Case', parentId: 'mobile-phones' },
          { id: 'screen-protector', name: 'Screen Protector', parentId: 'mobile-phones' }
        ]
      },
      {
        id: 'audio',
        name: 'Audio',
        parentId: 'small-electronics',
        children: [
          { id: 'headphones', name: 'Headphones', parentId: 'audio' },
          { id: 'portable-speakers', name: 'Portable Speakers', parentId: 'audio' },
          { id: 'soundbars', name: 'Soundbars', parentId: 'audio' },
          { id: 'radio', name: 'Radio', parentId: 'audio' },
          { id: 'speakers', name: 'Speakers', parentId: 'audio' },
          { id: 'stereo-system', name: 'Stereo System', parentId: 'audio' },
          { id: 'home-audio-systems', name: 'Home Audio Systems', parentId: 'audio' }
        ]
      },
      {
        id: 'photography-filming',
        name: 'Photography / Filming Equipment',
        parentId: 'small-electronics'
      },
      {
        id: 'lighting-equipment',
        name: 'Lighting Equipment',
        parentId: 'small-electronics'
      },
      {
        id: 'smart-watches',
        name: 'Smart Watches',
        parentId: 'small-electronics',
        children: [
          { id: 'smart-watches-main', name: 'Smart Watches', parentId: 'smart-watches' },
          { id: 'smart-watch-accessories', name: 'Smart Watch Accessories', parentId: 'smart-watches' }
        ]
      },
      {
        id: 'network-devices',
        name: 'Network Devices',
        parentId: 'small-electronics',
        children: [
          { id: 'routers', name: 'Routers', parentId: 'network-devices' },
          { id: 'nas', name: 'NAS', parentId: 'network-devices' },
          { id: 'nvrs', name: 'NVRs', parentId: 'network-devices' },
          { id: 'antenna', name: 'Antenna', parentId: 'network-devices' }
        ]
      },
      {
        id: 'chargers',
        name: 'Chargers',
        parentId: 'small-electronics'
      },
      {
        id: 'cables',
        name: 'Cables',
        parentId: 'small-electronics'
      },
      {
        id: 'projector',
        name: 'Projector',
        parentId: 'small-electronics'
      },
      {
        id: 'video',
        name: 'Video',
        parentId: 'small-electronics'
      },
      {
        id: 'battery',
        name: 'Battery',
        parentId: 'small-electronics'
      },
      {
        id: 'inkpad',
        name: 'InkPad',
        parentId: 'small-electronics'
      },
      {
        id: 'dog-tracker',
        name: 'Dog Tracker',
        parentId: 'small-electronics'
      },
      {
        id: 'small-electronics-other',
        name: 'Other',
        parentId: 'small-electronics'
      }
    ]
  },
  {
    id: 'large-electronics',
    name: 'Large Electronics',
    children: [
      {
        id: 'vacuum-cleaner',
        name: 'Vacuum Cleaner',
        parentId: 'large-electronics',
        children: [
          { id: 'vacuum-cleaner-main', name: 'Vacuum Cleaner', parentId: 'vacuum-cleaner' },
          { id: 'vacuum-accessories', name: 'Accessories', parentId: 'vacuum-cleaner' }
        ]
      },
      {
        id: 'printer',
        name: 'Printer',
        parentId: 'large-electronics',
        children: [
          { id: 'printer-main', name: 'Printer', parentId: 'printer' },
          { id: 'cartridge', name: 'Cartridge', parentId: 'printer' },
          { id: 'printer-accessories', name: 'Accessories', parentId: 'printer' }
        ]
      },
      {
        id: 'printers-plural',
        name: 'Printers (plural)',
        parentId: 'large-electronics'
      },
      {
        id: 'tvs',
        name: 'TV\'s',
        parentId: 'large-electronics',
        children: [
          { id: 'tvs-main', name: 'TV\'s', parentId: 'tvs' },
          { id: 'tv-soundbar', name: 'Soundbar', parentId: 'tvs' },
          { id: 'tv-accessories', name: 'Accessories', parentId: 'tvs' },
          { id: 'tv-mounts', name: 'TV Mounts', parentId: 'tvs' }
        ]
      },
      {
        id: 'air-conditioning',
        name: 'Air Conditioning',
        parentId: 'large-electronics'
      },
      {
        id: 'kitchen-electronics',
        name: 'Kitchen',
        parentId: 'large-electronics',
        children: [
          { id: 'cooker-hood', name: 'Cooker Hood', parentId: 'kitchen-electronics' }
        ]
      },
      {
        id: 'wall-chargers',
        name: 'Wall Chargers',
        parentId: 'large-electronics',
        children: [
          { id: 'wall-charger-accessories', name: 'Accessories', parentId: 'wall-chargers' }
        ]
      }
    ]
  },
  {
    id: 'home-kitchen',
    name: 'Home & Kitchen',
    children: [
      {
        id: 'coffee-machines',
        name: 'Coffee Machines',
        parentId: 'home-kitchen',
        children: [
          { id: 'coffee-machines-main', name: 'Coffee Machines', parentId: 'coffee-machines' },
          { id: 'coffee-capsules', name: 'Coffee Capsules', parentId: 'coffee-machines' },
          { id: 'coffee-machine-accessories', name: 'Coffee Machine Accessories', parentId: 'coffee-machines' }
        ]
      },
      {
        id: 'cleaning-robots',
        name: 'Cleaning Robots',
        parentId: 'home-kitchen'
      },
      {
        id: 'heaters',
        name: 'Heaters',
        parentId: 'home-kitchen'
      },
      {
        id: 'fans',
        name: 'Fans',
        parentId: 'home-kitchen'
      },
      {
        id: 'humidifiers',
        name: 'Humidifiers',
        parentId: 'home-kitchen'
      },
      {
        id: 'microwave',
        name: 'Microwave',
        parentId: 'home-kitchen'
      },
      {
        id: 'toasters',
        name: 'Toasters',
        parentId: 'home-kitchen'
      },
      {
        id: 'kettle',
        name: 'Kettle',
        parentId: 'home-kitchen'
      },
      {
        id: 'irons',
        name: 'Irons',
        parentId: 'home-kitchen'
      },
      {
        id: 'garment-steamers',
        name: 'Garment Steamers',
        parentId: 'home-kitchen'
      },
      {
        id: 'cookers',
        name: 'Cookers',
        parentId: 'home-kitchen'
      },
      {
        id: 'ovens',
        name: 'Ovens',
        parentId: 'home-kitchen'
      },
      {
        id: 'refrigerator',
        name: 'Refrigerator',
        parentId: 'home-kitchen'
      },
      {
        id: 'sewing-machines',
        name: 'Sewing Machines',
        parentId: 'home-kitchen'
      },
      {
        id: 'smart-lights',
        name: 'Smart Lights',
        parentId: 'home-kitchen'
      },
      {
        id: 'trash-bins',
        name: 'Trash Bins',
        parentId: 'home-kitchen'
      },
      {
        id: 'knifes',
        name: 'Knifes',
        parentId: 'home-kitchen'
      },
      {
        id: 'juicer',
        name: 'Juicer',
        parentId: 'home-kitchen'
      },
      {
        id: 'grill',
        name: 'Grill',
        parentId: 'home-kitchen'
      },
      {
        id: 'mixer',
        name: 'Mixer',
        parentId: 'home-kitchen'
      },
      {
        id: 'water-valve',
        name: 'Water Valve',
        parentId: 'home-kitchen'
      },
      {
        id: 'sandwich-maker',
        name: 'Sandwich Maker',
        parentId: 'home-kitchen'
      },
      {
        id: 'smart-trash-can',
        name: 'Smart Trash Can',
        parentId: 'home-kitchen'
      },
      {
        id: 'vacuum',
        name: 'Vacuum',
        parentId: 'home-kitchen'
      },
      {
        id: 'home-appliances',
        name: 'Home Appliances',
        parentId: 'home-kitchen'
      },
      {
        id: 'kitchen-appliances',
        name: 'Kitchen appliances',
        parentId: 'home-kitchen'
      },
      {
        id: 'pet-supplies',
        name: 'Pet Supplies',
        parentId: 'home-kitchen'
      },
      {
        id: 'ladders-platforms',
        name: 'Ladders & Platforms',
        parentId: 'home-kitchen'
      },
      {
        id: 'gym-equipment',
        name: 'Gym Equipment',
        parentId: 'home-kitchen'
      },
      {
        id: 'power-ring',
        name: 'Power Ring',
        parentId: 'home-kitchen'
      },
      {
        id: 'home-kitchen-accessories',
        name: 'Accessories',
        parentId: 'home-kitchen'
      },
      {
        id: 'extractor',
        name: 'Extractor',
        parentId: 'home-kitchen'
      },
      {
        id: 'cooker-hoods',
        name: 'Cooker Hoods',
        parentId: 'home-kitchen'
      },
      {
        id: 'washing-machines',
        name: 'Washing Machines',
        parentId: 'home-kitchen'
      },
      {
        id: 'toolbox',
        name: 'Toolbox',
        parentId: 'home-kitchen'
      },
      {
        id: 'home-kitchen-other',
        name: 'Other',
        parentId: 'home-kitchen'
      }
    ]
  },
  {
    id: 'sports-activity',
    name: 'Sports & Activity',
    children: [
      {
        id: 'gym-equipment-sports',
        name: 'Gym Equipment',
        parentId: 'sports-activity'
      },
      {
        id: 'power-ring-sports',
        name: 'Power Ring',
        parentId: 'sports-activity'
      },
      {
        id: 'helmets',
        name: 'Helmets',
        parentId: 'sports-activity'
      }
    ]
  },
  {
    id: 'car-vehicle',
    name: 'Car & Vehicle',
    children: [
      {
        id: 'vehicle-accessories',
        name: 'Vehicle Accessories',
        parentId: 'car-vehicle'
      },
      {
        id: 'car-gps',
        name: 'Car GPS',
        parentId: 'car-vehicle'
      },
      {
        id: 'dash-cam',
        name: 'Dash Cam',
        parentId: 'car-vehicle'
      },
      {
        id: 'car-audio',
        name: 'Car Audio',
        parentId: 'car-vehicle'
      },
      {
        id: 'car-speakers',
        name: 'Car Speakers',
        parentId: 'car-vehicle'
      },
      {
        id: 'obd-diagnostics',
        name: 'OBD Diagnostics',
        parentId: 'car-vehicle'
      },
      {
        id: 'scooters',
        name: 'Scooters',
        parentId: 'car-vehicle'
      },
      {
        id: 'electric-scooters',
        name: 'Electric Scooters',
        parentId: 'car-vehicle'
      },
      {
        id: 'electric-bicycle',
        name: 'Electric Bicycle',
        parentId: 'car-vehicle'
      }
    ]
  },
  {
    id: 'pets',
    name: 'Pets',
    children: [
      {
        id: 'pet-supplies-pets',
        name: 'Pet Supplies',
        parentId: 'pets'
      },
      {
        id: 'pets-accessories',
        name: 'Pets Accessories',
        parentId: 'pets'
      }
    ]
  },
  {
    id: 'gaming-consoles',
    name: 'Gaming & Consoles',
    children: [
      {
        id: 'console',
        name: 'Console',
        parentId: 'gaming-consoles'
      },
      {
        id: 'console-games',
        name: 'Console Games',
        parentId: 'gaming-consoles'
      },
      {
        id: 'gaming-chair',
        name: 'Gaming Chair',
        parentId: 'gaming-consoles'
      },
      {
        id: 'pc-gaming',
        name: 'PC',
        parentId: 'gaming-consoles'
      }
    ]
  },
  {
    id: 'office-printers',
    name: 'Office & Printers',
    children: [
      {
        id: 'scanners-printers',
        name: 'Scanners & Printers',
        parentId: 'office-printers'
      },
      {
        id: 'printer-office',
        name: 'Printer',
        parentId: 'office-printers'
      }
    ]
  },
  {
    id: 'labels-printing',
    name: 'Labels & Printing',
    children: [
      {
        id: 'label-printer',
        name: 'Label Printer',
        parentId: 'labels-printing'
      },
      {
        id: 'inkpad-labels',
        name: 'InkPad',
        parentId: 'labels-printing'
      },
      {
        id: 'cartridge-labels',
        name: 'Cartridge',
        parentId: 'labels-printing'
      }
    ]
  },
  {
    id: 'uncategorized',
    name: 'Uncategorized'
  }
]

// Helper function to get all categories as a flat array
export function getAllCategories(): Category[] {
  const categories: Category[] = []
  
  function addCategory(category: Category) {
    categories.push(category)
    if (category.children) {
      category.children.forEach(addCategory)
    }
  }
  
  PRODUCT_CATEGORIES.forEach(addCategory)
  return categories
}

// Helper function to get category by ID
export function getCategoryById(id: string): Category | undefined {
  function findCategory(categories: Category[]): Category | undefined {
    for (const category of categories) {
      if (category.id === id) return category
      if (category.children) {
        const found = findCategory(category.children)
        if (found) return found
      }
    }
    return undefined
  }
  
  return findCategory(PRODUCT_CATEGORIES)
}

// Helper function to get category path (breadcrumb)
export function getCategoryPath(id: string): Category[] {
  const path: Category[] = []
  
  function findPath(categories: Category[], targetId: string): boolean {
    for (const category of categories) {
      path.push(category)
      if (category.id === targetId) return true
      if (category.children) {
        if (findPath(category.children, targetId)) return true
      }
      path.pop()
    }
    return false
  }
  
  findPath(PRODUCT_CATEGORIES, id)
  return path
}

// Helper function to get all top-level categories
export function getTopLevelCategories(): Category[] {
  return PRODUCT_CATEGORIES
}

// Helper function to get children of a category
export function getCategoryChildren(parentId: string): Category[] {
  const parent = getCategoryById(parentId)
  return parent?.children || []
}
