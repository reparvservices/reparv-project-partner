import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  LISTING_TYPES,
  showBhkFor,
  maxPhotosFor,
  imageSectionsFor,
  ALL_IMAGE_SECTIONS,
} from "../src/utils/propertyListing.js";

// Photo columns the server stores (reparv-server/src/core/utils/propertyListing.js)
const SERVER_IMAGE_KEYS = [
  "frontView", "sideView", "hallView", "kitchenView", "bedroomView",
  "bathroomView", "balconyView", "nearestLandmark", "developedAmenities",
  "interiorView", "entranceView", "roadView", "parkingView", "officeArea",
  "cabinView", "washroomView", "warehouseArea", "loadingArea",
  "showroomInterior", "displayArea", "terraceSitout", "farmGardenArea",
  "extraImages",
];

describe("photo sections", () => {
  test("every section key is a column the server stores, and all are covered", () => {
    const keys = ALL_IMAGE_SECTIONS.map((s) => s.key).sort();
    assert.deepEqual(keys, [...SERVER_IMAGE_KEYS].sort());
  });

  test("front view is always first and required", () => {
    for (const category of ["NewFlat", "NewPlot", "NewShop", "OfficeSpace", "Warehouse", "Showrooms", "FarmHouse"]) {
      const [first] = imageSectionsFor(category);
      assert.equal(first.key, "frontView", category);
      assert.equal(first.required, true, category);
    }
  });

  test("category picks the right photo set", () => {
    const keys = (c) => imageSectionsFor(c).map((s) => s.key);
    assert.ok(keys("NewFlat").includes("bedroomView"));
    assert.ok(keys("NewPlot").includes("developedAmenities"));
    assert.ok(keys("RentalShop").includes("roadView"));
    assert.ok(keys("RentalOffice").includes("cabinView"));
    assert.ok(keys("ResaleGodown").includes("loadingArea"));
    assert.ok(keys("RentalShowroom").includes("displayArea"));
    assert.ok(keys("FarmHouse").includes("farmGardenArea"));
  });

  test("photo limits: 10 extra, 5 elsewhere", () => {
    assert.equal(maxPhotosFor("extraImages"), 10);
    assert.equal(maxPhotosFor("frontView"), 5);
  });
});

describe("listing rules", () => {
  test("Buy is not a listing type any more", () => {
    assert.ok(!LISTING_TYPES.some((t) => String(t.value ?? t).toLowerCase() === "buy"));
  });

  test("BHK only for homes", () => {
    assert.equal(showBhkFor("NewFlat"), true);
    assert.equal(showBhkFor("RentalFlat"), true);
    assert.equal(showBhkFor("NewPlot"), false);
    assert.equal(showBhkFor("RentalShop"), false);
    assert.equal(showBhkFor(""), false);
  });
});
