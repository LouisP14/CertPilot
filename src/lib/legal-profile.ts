type OptionalString = string | null;

function clean(value: string | undefined): OptionalString {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export const legalProfile = {
  brandName: process.env.NEXT_PUBLIC_LEGAL_BRAND_NAME || "CertPilot",
  legalEntityName: clean(process.env.NEXT_PUBLIC_LEGAL_ENTITY_NAME),
  legalForm: clean(process.env.NEXT_PUBLIC_LEGAL_FORM),
  address: clean(process.env.NEXT_PUBLIC_LEGAL_ADDRESS),
  siret: clean(process.env.NEXT_PUBLIC_LEGAL_SIRET),
  rcs: clean(process.env.NEXT_PUBLIC_LEGAL_RCS),
  vatNumber: clean(process.env.NEXT_PUBLIC_LEGAL_VAT_NUMBER),
  publicationDirector: clean(
    process.env.NEXT_PUBLIC_LEGAL_PUBLICATION_DIRECTOR,
  ),
  contactEmail:
    process.env.NEXT_PUBLIC_LEGAL_CONTACT_EMAIL || "contact@certpilot.eu",
  dpoEmail: process.env.NEXT_PUBLIC_DPO_EMAIL || "contact@certpilot.eu",
  hostName: process.env.NEXT_PUBLIC_HOST_NAME || "Railway",
  hostAddress:
    process.env.NEXT_PUBLIC_HOST_ADDRESS || "Infrastructure cloud (UE/USA)",
  hostWebsite: process.env.NEXT_PUBLIC_HOST_WEBSITE || "https://railway.app",
};

export const legalMissingFields = {
  companyIdentity:
    !legalProfile.legalEntityName ||
    !legalProfile.legalForm ||
    !legalProfile.address,
  registration: !legalProfile.siret || !legalProfile.rcs,
  tax: !legalProfile.vatNumber,
  publication: !legalProfile.publicationDirector,
};

export const legalIsSetupComplete =
  !legalMissingFields.companyIdentity &&
  !legalMissingFields.registration &&
  !legalMissingFields.tax &&
  !legalMissingFields.publication;
