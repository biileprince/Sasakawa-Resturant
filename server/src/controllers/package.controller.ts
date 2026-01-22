//server/src/controllers/package.controller.ts

import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Default packages used when database is empty
const DEFAULT_PACKAGES = {
  "Breakfast Service": [
    {
      packageId: "breakfast_basic",
      name: "Basic Breakfast Package",
      pricePerPerson: 15,
      description: "Tea/Coffee, Bread, Butter, Jam",
      image:
        "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=300&fit=crop",
      includes: [
        "Hot Tea/Coffee",
        "Fresh Bread",
        "Butter & Jam",
        "Sugar & Milk",
      ],
    },
    {
      packageId: "breakfast_standard",
      name: "Standard Breakfast Package",
      pricePerPerson: 25,
      description: "Tea/Coffee, Bread, Eggs, Sausage, Fruit",
      image:
        "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400&h=300&fit=crop",
      includes: [
        "Hot Tea/Coffee",
        "Fresh Bread",
        "Scrambled Eggs",
        "Sausages",
        "Fresh Fruit",
        "Juice",
      ],
    },
    {
      packageId: "breakfast_premium",
      name: "Premium Breakfast Package",
      pricePerPerson: 35,
      description:
        "Full Continental Breakfast with Local & International Options",
      image:
        "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=400&h=300&fit=crop",
      includes: [
        "Continental Buffet",
        "Local Dishes",
        "Premium Coffee",
        "Fresh Juices",
        "Pastries",
        "Cereals",
      ],
    },
  ],
  "Lunch Service": [
    {
      packageId: "lunch_basic",
      name: "Basic Lunch Package",
      pricePerPerson: 30,
      description: "Rice, Stew, Protein, Water",
      image:
        "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop",
      includes: [
        "Jollof/White Rice",
        "Stew",
        "Chicken/Fish",
        "Water",
        "Fruits",
      ],
    },
    {
      packageId: "lunch_standard",
      name: "Standard Lunch Package",
      pricePerPerson: 45,
      description: "Rice, Stew, Protein, Vegetables, Fruit, Drink",
      image:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop",
      includes: [
        "Jollof/Fried Rice",
        "Stew",
        "Grilled Protein",
        "Vegetables",
        "Salad",
        "Soft Drinks",
        "Dessert",
      ],
    },
    {
      packageId: "lunch_premium",
      name: "Premium Lunch Package",
      pricePerPerson: 60,
      description: "Multiple Options, Dessert, Premium Drinks",
      image:
        "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop",
      includes: [
        "Multiple Rice Options",
        "Variety of Proteins",
        "Gourmet Sides",
        "Premium Drinks",
        "Ice Cream",
        "Local Delicacies",
      ],
    },
    {
      packageId: "lunch_local",
      name: "Local Cuisine Package",
      pricePerPerson: 35,
      description: "Traditional Ghanaian Dishes",
      image:
        "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400&h=300&fit=crop",
      includes: [
        "Waakye/Banku",
        "Palm Nut Soup",
        "Tilapia/Goat",
        "Shito",
        "Kelewele",
        "Sobolo",
      ],
    },
  ],
  "Dinner Service": [
    {
      packageId: "dinner_basic",
      name: "Basic Dinner Package",
      pricePerPerson: 40,
      description: "Rice/Yam, Stew, Protein, Water",
      image:
        "https://images.unsplash.com/photo-1574484284002-952d92456975?w=400&h=300&fit=crop",
      includes: [
        "Rice/Boiled Yam",
        "Tomato Stew",
        "Grilled Chicken",
        "Water",
        "Fruits",
      ],
    },
    {
      packageId: "dinner_standard",
      name: "Standard Dinner Package",
      pricePerPerson: 55,
      description: "Rice/Yam, Stew, Protein, Vegetables, Drink",
      image:
        "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&h=300&fit=crop",
      includes: [
        "Jollof Rice/Fried Yam",
        "Rich Stew",
        "Premium Protein",
        "Steamed Vegetables",
        "Soft Drinks",
        "Side Salad",
      ],
    },
    {
      packageId: "dinner_premium",
      name: "Premium Dinner Package",
      pricePerPerson: 75,
      description: "Multi-course Dinner with Premium Options",
      image:
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop",
      includes: [
        "3-Course Meal",
        "Appetizer",
        "Main Course",
        "Dessert",
        "Wine/Premium Drinks",
        "Cheese Board",
      ],
    },
  ],
  "Special Events": [
    {
      packageId: "event_cocktail",
      name: "Cocktail Package",
      pricePerPerson: 50,
      description: "Finger Foods, Appetizers, Drinks",
      image:
        "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
      includes: [
        "Canapés",
        "Finger Foods",
        "Cocktails",
        "Wine",
        "Champagne",
        "Appetizer Platters",
      ],
    },
    {
      packageId: "event_gala",
      name: "Gala Dinner Package",
      pricePerPerson: 100,
      description: "3-course Gala Dinner with Premium Service",
      image:
        "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=400&h=300&fit=crop",
      includes: [
        "Welcome Cocktail",
        "3-Course Dinner",
        "Premium Wine Pairing",
        "Live Entertainment",
        "Decorative Setup",
        "Cake Cutting",
      ],
    },
    {
      packageId: "event_celebration",
      name: "Celebration Package",
      pricePerPerson: 80,
      description: "Party Food, Cake, Decorative Setup",
      image:
        "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&h=300&fit=crop",
      includes: [
        "Party Platters",
        "Custom Cake",
        "Decorations",
        "Party Drinks",
        "Music Setup",
        "Photography Corner",
      ],
    },
  ],
  "Corporate Meetings": [
    {
      packageId: "meeting_light",
      name: "Light Refreshments",
      pricePerPerson: 20,
      description: "Tea/Coffee, Biscuits, Light Snacks",
      image:
        "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&h=300&fit=crop",
      includes: [
        "Tea/Coffee",
        "Assorted Biscuits",
        "Light Snacks",
        "Water",
        "Fruits",
        "Note Pads",
      ],
    },
    {
      packageId: "meeting_full",
      name: "Full Meeting Package",
      pricePerPerson: 40,
      description: "Breakfast/Lunch, Refreshments, Water",
      image:
        "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=300&fit=crop",
      includes: [
        "Morning Breakfast",
        "Lunch",
        "2 Coffee Breaks",
        "Water Bottles",
        "Meeting Materials",
        "Wi-Fi Access",
      ],
    },
  ],
  "Academic Events": [
    {
      packageId: "academic_conference",
      name: "Conference Package",
      pricePerPerson: 35,
      description: "Breakfast, Lunch, 2 Coffee Breaks",
      image:
        "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop",
      includes: [
        "Welcome Breakfast",
        "Conference Lunch",
        "2 Coffee Breaks",
        "Conference Materials",
        "Name Tags",
        "Certificates",
      ],
    },
    {
      packageId: "academic_seminar",
      name: "Seminar Package",
      pricePerPerson: 25,
      description: "Light Meal, Refreshments",
      image:
        "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=400&h=300&fit=crop",
      includes: [
        "Light Lunch",
        "Tea/Coffee Break",
        "Snacks",
        "Seminar Materials",
        "Feedback Forms",
        "Networking Session",
      ],
    },
    {
      packageId: "academic_workshop",
      name: "Workshop Package",
      pricePerPerson: 30,
      description: "Lunch, Coffee Breaks, Snacks",
      image:
        "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=300&fit=crop",
      includes: [
        "Workshop Lunch",
        "Morning Coffee",
        "Afternoon Break",
        "Hands-on Materials",
        "Take-home Resources",
        "Group Activities",
      ],
    },
  ],
};

// Get all food packages (grouped by category)
export async function getAllPackages(req: Request, res: Response) {
  try {
    const packages = await prisma.foodPackage.findMany({
      where: { isActive: true },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    });

    // If no packages in database, return default packages
    if (packages.length === 0) {
      return res.json(DEFAULT_PACKAGES);
    }

    // Group packages by category
    const grouped = packages.reduce(
      (acc, pkg) => {
        if (!acc[pkg.category]) {
          acc[pkg.category] = [];
        }
        acc[pkg.category].push({
          id: pkg.packageId,
          name: pkg.name,
          pricePerPerson: Number(pkg.pricePerPerson),
          description: pkg.description,
          image: pkg.image,
          includes: pkg.includes,
        });
        return acc;
      },
      {} as Record<string, any[]>
    );

    res.json(grouped);
  } catch (error) {
    console.error("Error fetching packages:", error);
    res.status(500).json({ error: "Failed to fetch packages" });
  }
}

// Get all packages for admin (including inactive)
export async function getAdminPackages(req: Request, res: Response) {
  try {
    const packages = await prisma.foodPackage.findMany({
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    });

    res.json(packages);
  } catch (error) {
    console.error("Error fetching admin packages:", error);
    res.status(500).json({ error: "Failed to fetch packages" });
  }
}

// Create a new package
export async function createPackage(req: Request, res: Response) {
  try {
    const {
      packageId,
      name,
      category,
      pricePerPerson,
      description,
      image,
      includes,
      isActive = true,
      sortOrder = 0,
    } = req.body;

    // Validate required fields
    if (
      !packageId ||
      !name ||
      !category ||
      !pricePerPerson ||
      !description ||
      !image ||
      !includes
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const newPackage = await prisma.foodPackage.create({
      data: {
        packageId,
        name,
        category,
        pricePerPerson,
        description,
        image,
        includes,
        isActive,
        sortOrder,
      },
    });

    res.status(201).json(newPackage);
  } catch (error: any) {
    console.error("Error creating package:", error);
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ error: "A package with this ID already exists" });
    }
    res.status(500).json({ error: "Failed to create package" });
  }
}

// Update a package
export async function updatePackage(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const {
      packageId,
      name,
      category,
      pricePerPerson,
      description,
      image,
      includes,
      isActive,
      sortOrder,
    } = req.body;

    const updatedPackage = await prisma.foodPackage.update({
      where: { id },
      data: {
        packageId,
        name,
        category,
        pricePerPerson,
        description,
        image,
        includes,
        isActive,
        sortOrder,
      },
    });

    res.json(updatedPackage);
  } catch (error: any) {
    console.error("Error updating package:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Package not found" });
    }
    res.status(500).json({ error: "Failed to update package" });
  }
}

// Delete a package
export async function deletePackage(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await prisma.foodPackage.delete({
      where: { id },
    });

    res.json({ message: "Package deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting package:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Package not found" });
    }
    res.status(500).json({ error: "Failed to delete package" });
  }
}

// Seed default packages to database
export async function seedPackages(req: Request, res: Response) {
  try {
    const existingCount = await prisma.foodPackage.count();
    if (existingCount > 0) {
      return res.status(400).json({ error: "Packages already exist in database" });
    }

    const packagesToCreate: any[] = [];
    let sortOrder = 0;

    for (const [category, packages] of Object.entries(DEFAULT_PACKAGES)) {
      for (const pkg of packages) {
        packagesToCreate.push({
          ...pkg,
          category,
          sortOrder: sortOrder++,
          isActive: true,
        });
      }
    }

    await prisma.foodPackage.createMany({
      data: packagesToCreate,
    });

    const createdPackages = await prisma.foodPackage.findMany({
      orderBy: { sortOrder: "asc" },
    });

    res.status(201).json({
      message: `Successfully seeded ${createdPackages.length} packages`,
      packages: createdPackages,
    });
  } catch (error) {
    console.error("Error seeding packages:", error);
    res.status(500).json({ error: "Failed to seed packages" });
  }
}
