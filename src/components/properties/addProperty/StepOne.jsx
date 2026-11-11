import React, { useState, useEffect } from "react";
import { useAuth } from "../../../store/auth";
import LocationPicker from "./LocationPicker";
import TagsInput from "./TagsInput";
import {
  SectionHeader,
  FieldLabel,
  FieldInput,
  FieldSelect,
  FieldTextarea,
  PillSelect,
  Divider,
  Grid2,
  Grid3,
} from "./FormUI";

import PropertyClassification from "./PropertyClassification";
import { classificationFromProperty } from "../../../utils/propertyListing";

const RENTAL_CATS = [
  "RentalFlat",
  "RentalVilla",
  "RentalShop",
  "RentalOffice",
  "RentalHouse",
  "RentalGodown",
  "RentalOpenLand",
  "RentalShowroom",
  "RentalPlot",
];

export default function StepOne({
  newProperty,
  setPropertyData,
  builderData,
  authorities,
  states,
  cities,
}) {
  const { URI } = useAuth();
  // New Launch / Resale: follows the loaded category until the user picks one
  const [conditionChoice, setCondition] = useState(null);
  const [isSame, setIsSame] = useState(true);
  const [message, setMessage] = useState("");

  const isRental = RENTAL_CATS.includes(newProperty?.propertyCategory);

  /* Property name uniqueness check */
  const checkPropertyName = async () => {
    if (!newProperty.propertyName) return;
    try {
      const res = await fetch(`${URI}/admin/properties/check-property-name`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProperty),
      });
      const data = await res.json();
      setIsSame(data.unique);
      setMessage(data.message);
    } catch {
      setMessage("Could not verify name");
    }
  };

  useEffect(() => {
    if (!newProperty.propertyid) checkPropertyName();
  }, [newProperty.propertyName]);

  const set = (key, val) => setPropertyData({ ...newProperty, [key]: val });

  const classification = {
    ...classificationFromProperty(newProperty),
    ...(newProperty.listingType ? { listingType: newProperty.listingType } : {}),
    ...(newProperty.propertyKind ? { propertyKind: newProperty.propertyKind } : {}),
    condition:
      conditionChoice ?? classificationFromProperty(newProperty).condition,
  };

  return (
    <div className="space-y-0">
      {/* ── Property Category ── */}
      <SectionHeader
        title="Property Type"
        subtitle="What type of property are you listing?"
      />

      <div className="pb-4">
        <PropertyClassification
          bare
          listingType={classification.listingType}
          condition={classification.condition}
          propertyKind={classification.propertyKind}
          propertyCategory={newProperty.propertyCategory}
          onChange={({ listingType, condition: nextCondition, propertyKind, propertyCategory }) => {
            setCondition(nextCondition);
            setPropertyData({ ...newProperty, listingType, propertyKind, propertyCategory });
          }}
        />
      </div>

      <Divider />

      {/* ── Basic Details ── */}
      <SectionHeader
        title="Basic Details"
        subtitle="Builder, project name and possession"
      />
      <Grid2>
        <div>
          <FieldLabel active={!!newProperty.builderid}>
            Builder / Company
          </FieldLabel>
          <FieldSelect
            value={newProperty.builderid}
            onChange={(e) => set("builderid", e.target.value)}
          >
            <option value="">Select Builder</option>
            {builderData.length > 0 && builderData.map((b) => (
              <option key={b.builderid} value={b.builderid}>
                {b.company_name}
              </option>
            ))}
          </FieldSelect>
        </div>

        {!isRental && (
          <div>
            <FieldLabel active={!!newProperty.projectBy}>Project By</FieldLabel>
            <FieldInput
              placeholder="e.g. XYZ Developers"
              value={newProperty.projectBy}
              onChange={(e) => set("projectBy", e.target.value)}
            />
          </div>
        )}

        {!["RentalFlat", "RentalShop", "RentalOffice"].includes(
          newProperty.propertyCategory,
        ) && (
          <div>
            <FieldLabel active={!!newProperty.possessionDate}>
              Possession Date
            </FieldLabel>
            <FieldInput
              type="date"
              value={
                newProperty.possessionDate
                  ? new Date(newProperty.possessionDate)
                      .toISOString()
                      .split("T")[0]
                  : ""
              }
              onChange={(e) => set("possessionDate", e.target.value || null)}
            />
          </div>
        )}

        {newProperty.propertyCategory !== "FarmLand" && (
          <div>
            <FieldLabel active={!!newProperty.propertyApprovedBy}>
              Approved By <span className="text-red-500">*</span>
            </FieldLabel>
            <FieldSelect
              value={newProperty.propertyApprovedBy}
              onChange={(e) => set("propertyApprovedBy", e.target.value)}
              required
            >
              <option value="">Select Authority</option>
              {authorities?.map((a, i) => (
                <option key={i} value={a.authorityNACL}>
                  {a.authorityNACL}
                </option>
              ))}
            </FieldSelect>
          </div>
        )}
      </Grid2>

      <Divider />

      {/* ── Property Name ── */}
      <SectionHeader
        title="Property Name"
        subtitle="This name will appear publicly"
      />
      <div>
        <FieldLabel active={isSame && !!newProperty.propertyName} required>
          <span className={isSame === false ? "text-red-500" : ""}>
            {message || "Property Name"}
          </span>
        </FieldLabel>
        <FieldInput
          placeholder="Enter property name"
          value={newProperty.propertyName}
          onChange={(e) => set("propertyName", e.target.value)}
          required
        />
        {isSame === false && (
          <p className="mt-1.5 text-xs text-red-500">{message}</p>
        )}
      </div>

      <Divider />

      {/* ── Pricing ── */}
      <SectionHeader title="Pricing" subtitle="Sales and offer price" />
      <Grid2>
        <div>
          <FieldLabel active={!!newProperty.totalSalesPrice} required>
            Total Sales Price
          </FieldLabel>
          <FieldInput
            icon="₹"
            type="number"
            min="0"
            placeholder="0"
            value={newProperty.totalSalesPrice}
            onChange={(e) =>
              set("totalSalesPrice", Math.max(0, e.target.value))
            }
            required
          />
        </div>
        <div>
          <FieldLabel active={!!newProperty.totalOfferPrice} required>
            Total Offer Price
          </FieldLabel>
          <FieldInput
            icon="₹"
            type="number"
            min="0"
            placeholder="0"
            value={newProperty.totalOfferPrice}
            onChange={(e) =>
              set("totalOfferPrice", Math.max(0, e.target.value))
            }
            required
          />
        </div>
      </Grid2>

      <Divider />

      {/* ── Location ── */}
      <SectionHeader title="Location" subtitle="Address and coordinates" />
      <div className="space-y-4">
        <div>
          <FieldLabel active={!!newProperty.address} required>
            Address
          </FieldLabel>
          <FieldInput
            placeholder="Full address"
            value={newProperty.address}
            onChange={(e) => set("address", e.target.value)}
            required
          />
        </div>

        <Grid3>
          <div>
            <FieldLabel active={!!newProperty.state} required>
              State
            </FieldLabel>
            <FieldSelect
              value={newProperty.state}
              onChange={(e) => set("state", e.target.value)}
              required
            >
              <option value="">Select State</option>
              {states?.map((s, i) => (
                <option key={i} value={s.state}>
                  {s.state}
                </option>
              ))}
            </FieldSelect>
          </div>
          <div>
            <FieldLabel active={!!newProperty.city} required>
              City
            </FieldLabel>
            <FieldSelect
              value={newProperty.city}
              onChange={(e) => set("city", e.target.value)}
              required
            >
              <option value="">Select City</option>
              {cities?.map((c, i) => (
                <option key={i} value={c.city}>
                  {c.city}
                </option>
              ))}
            </FieldSelect>
          </div>
          <div>
            <FieldLabel active={!!newProperty.pincode} required>
              Pin Code
            </FieldLabel>
            <FieldInput
              type="number"
              placeholder="6-digit code"
              value={newProperty.pincode}
              onChange={(e) => {
                if (/^\d{0,6}$/.test(e.target.value))
                  set("pincode", e.target.value);
              }}
              required
            />
          </div>
        </Grid3>

        <Grid2>
          <div>
            <FieldLabel active={!!newProperty.location} required>
              Locality / Area
            </FieldLabel>
            <FieldInput
              placeholder="Locality name"
              value={newProperty.location}
              onChange={(e) => set("location", e.target.value)}
              required
            />
          </div>
          <div>
            <FieldLabel active={!!newProperty.distanceFromCityCenter} required>
              Distance from City Center
            </FieldLabel>
            <FieldSelect
              value={newProperty.distanceFromCityCenter}
              onChange={(e) => set("distanceFromCityCenter", e.target.value)}
              required
            >
              <option value="">Select distance</option>
              {Array.from({ length: 25 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1} km
                </option>
              ))}
            </FieldSelect>
          </div>
        </Grid2>

        {/* Map picker */}
        {newProperty.state && newProperty.city && newProperty.pincode && (
          <div>
            <FieldLabel
              active={!!(newProperty.latitude && newProperty.longitude)}
              required
            >
              Pin on Map
            </FieldLabel>
            <div className="rounded-2xl overflow-hidden border border-gray-200">
              <LocationPicker
                onChange={({ latitude, longitude }) =>
                  setPropertyData({ ...newProperty, latitude, longitude })
                }
                state={newProperty.state}
                city={newProperty.city}
                pincode={newProperty.pincode}
                latitude={newProperty.latitude}
                longitude={newProperty.longitude}
              />
            </div>
          </div>
        )}
      </div>

      <Divider />

      {/* ── Other Charges ── */}
      <SectionHeader
        title="Charges & Taxes"
        subtitle="Applicable rates and fees"
      />
      <Grid2>
        <div>
          <FieldLabel active={!!newProperty.stampDuty} required>
            Stamp Duty
          </FieldLabel>
          <FieldSelect
            icon="%"
            value={newProperty.stampDuty}
            onChange={(e) => set("stampDuty", e.target.value)}
            required
          >
            <option value="">Select %</option>
            <option value="0.25">0.25%</option>
            <option value="5">5%</option>
            <option value="6">6%</option>
            <option value="7">7%</option>
          </FieldSelect>
        </div>

        {!isRental && (
          <div>
            <FieldLabel active={!!newProperty.registrationFee}>
              Registration Fee
            </FieldLabel>
            <FieldSelect
              icon="%"
              value={newProperty.registrationFee}
              onChange={(e) => set("registrationFee", e.target.value)}
            >
              <option value="">Select fee</option>
              <option value="1">1%</option>
              <option value="30000">₹ 30,000</option>
            </FieldSelect>
          </div>
        )}

        {!isRental && (
          <div>
            <FieldLabel active={!!newProperty.gst}>GST</FieldLabel>
            <FieldSelect
              icon="%"
              value={newProperty.gst}
              onChange={(e) => set("gst", e.target.value)}
            >
              <option value="">Select %</option>
              <option value="0">0%</option>
              <option value="1">1%</option>
              <option value="5">5%</option>
            </FieldSelect>
          </div>
        )}

        {!isRental && (
          <div>
            <FieldLabel active={!!newProperty.advocateFee}>
              Advocate Fee
            </FieldLabel>
            <FieldSelect
              icon="₹"
              value={newProperty.advocateFee}
              onChange={(e) => set("advocateFee", e.target.value)}
            >
              <option value="">Select fee</option>
              <option value="0">₹ 0</option>
              <option value="10000">₹ 10,000</option>
              <option value="15000">₹ 15,000</option>
              <option value="20000">₹ 20,000</option>
              <option value="25000">₹ 25,000</option>
            </FieldSelect>
          </div>
        )}

        {!isRental && (
          <div>
            <FieldLabel active={!!newProperty.maintenance}>
              Maintenance
            </FieldLabel>
            <FieldInput
              icon="₹"
              type="number"
              min="0"
              placeholder="0"
              value={newProperty.maintenance}
              onChange={(e) => set("maintenance", Math.max(0, e.target.value))}
            />
          </div>
        )}

        {!isRental && (
          <div>
            <FieldLabel active={!!newProperty.msebWater}>
              MSEB &amp; Water Charges
            </FieldLabel>
            <FieldInput
              icon="₹"
              type="number"
              min="0"
              placeholder="0"
              value={newProperty.msebWater}
              onChange={(e) => set("msebWater", Math.max(0, e.target.value))}
            />
          </div>
        )}

        <div>
          <FieldLabel active={!!newProperty.other} required>
            Other Charges
          </FieldLabel>
          <FieldInput
            icon="₹"
            type="number"
            min="0"
            placeholder="0"
            value={newProperty.other}
            onChange={(e) => set("other", Math.max(0, e.target.value))}
            required
          />
        </div>
      </Grid2>

      <Divider />

      {/* ── Tags ── */}
      <SectionHeader
        title="Tags"
        subtitle="Keywords to help buyers find this property"
      />
      <TagsInput newProperty={newProperty} setPropertyData={setPropertyData} />
    </div>
  );
}
