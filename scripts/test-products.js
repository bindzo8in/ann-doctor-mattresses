const BASE_URL = 'http://localhost:3000';

const defaultValues = {
  name: "Test Product " + Date.now(),
  slug: "test-product-" + Date.now(),
  type: "MATTRESS",
  shortDescription: [{ id: '1', text: 'Comfortable' }],
  firmness: "MEDIUM",
  comfortLevel: "BALANCED",
  healthBenefits: [],
  recommendedPositions: [],
  categoryId: "cat_002",
  thumbnail: { url: "", publicId: "" },
  images: [],
  variants: [],
  allowCustomSize: false,
  minWidth: null,
  maxWidth: null,
  minLength: null,
  maxLength: null,
  customSizePricing: null,
  specifications: [],
  sectionsHeading: "default heading",
  sections: [
    {
      type: "FEATURES_WITH_IMAGE",
      title: "Features",
      sortOrder: 1,
      content: {
        description: "",
        image: null,
        features: [{ title: "", description: "" }],
      },
    },
  ],
  faqs: [],
  isFeatured: false,
  isActive: true,
};

async function runTests() {
  console.log('--- Starting API Tests ---');

  let categoryId = 'cat_002';
  try {
    const catRes = await fetch(`${BASE_URL}/api/categories`);
    const cats = await catRes.json();
    if (cats.items && cats.items.length > 0) {
      categoryId = cats.items[0].id;
      console.log('Found category ID:', categoryId);
      defaultValues.categoryId = categoryId;
    }
  } catch (e) {
    console.log('Could not fetch categories, using mock ID');
  }

  console.log('\n--- 1. Testing POST (Draft Creation) ---');
  let productId;
  try {
    const postRes = await fetch(`${BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(defaultValues)
    });
    const postData = await postRes.json();
    console.log('POST Response:', JSON.stringify(postData, null, 2));
    if (!postData.success) throw new Error('POST failed');
    productId = postData.data.id;
  } catch (err) {
    console.error('POST Error:', err);
    return;
  }

  console.log('\n--- 2. Testing PUT (Incremental Update - Media & Variants) ---');
  let imageId, variantId, sectionId;
  try {
    const putPayload1 = {
      ...defaultValues,
      thumbnail: { url: 'http://example.com/thumb.jpg', publicId: 'thumb_123' },
      images: [
        { url: 'http://example.com/img1.jpg', publicId: 'img1', sortOrder: 0 }
      ],
      variants: [
        {
          variantType: 'MATTRESS',
          sizeName: 'QUEEN',
          width: 60,
          length: 80,
          thickness: 8,
          mrp: 1000,
          salePrice: 800,
          isDefault: true
        }
      ],
    };

    const putRes1 = await fetch(`${BASE_URL}/api/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(putPayload1)
    });
    const putData1 = await putRes1.json();
    console.log('PUT 1 Response:', JSON.stringify(putData1, null, 2));
    if (!putData1.success) throw new Error('PUT 1 failed');

    imageId = putData1.product.images[0].id;
    variantId = putData1.product.variants[0].id;
    sectionId = putData1.product.sections[0].id;
    console.log('Created Image ID:', imageId);
    console.log('Created Variant ID:', variantId);
    console.log('Created Section ID:', sectionId);
  } catch (err) {
    console.error('PUT 1 Error:', err);
    return;
  }

  console.log('\n--- 3. Testing PUT (Differential Update) ---');
  try {
    const putPayload2 = {
      ...defaultValues,
      thumbnail: { url: 'http://example.com/thumb.jpg', publicId: 'thumb_123' },
      images: [
        { id: imageId, url: 'http://example.com/img1.jpg', publicId: 'img1', sortOrder: 1 }, // Changed sortOrder
        { url: 'http://example.com/img2.jpg', publicId: 'img2', sortOrder: 2 } // New image
      ],
      variants: [
        {
          id: variantId,
          variantType: 'MATTRESS',
          sizeName: 'KING', // Changed size
          width: 76,
          length: 80,
          thickness: 8,
          mrp: 1200, // Changed MRP
          salePrice: 900, // Changed sale price
          isDefault: true
        }
      ],
      sections: [
        {
          id: sectionId,
          type: "FEATURES_WITH_IMAGE",
          title: "Features Updated",
          sortOrder: 1,
          content: {
            description: "Updated description",
            image: null,
            features: [{ title: "F1", description: "D1" }],
          },
        }
      ]
    };

    const putRes2 = await fetch(`${BASE_URL}/api/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(putPayload2)
    });
    const putData2 = await putRes2.json();
    console.log('PUT 2 Response:', JSON.stringify(putData2, null, 2));
    
    // Verify changes
    const updatedImage = putData2.product.images.find(img => img.id === imageId);
    if (updatedImage.sortOrder !== 1) console.error('Image update failed');
    else console.log('Image update SUCCESS');
    
    const updatedVariant = putData2.product.variants.find(v => v.id === variantId);
    if (updatedVariant.mrp !== '1200') console.error('Variant update failed, expected mrp 1200 got', updatedVariant.mrp);
    else console.log('Variant update SUCCESS');

    const updatedSection = putData2.product.sections.find(s => s.id === sectionId);
    if (updatedSection.content.title !== "Features Updated") console.error('Section update failed');
    else console.log('Section update SUCCESS');

  } catch (err) {
    console.error('PUT 2 Error:', err);
  }
}

runTests();
