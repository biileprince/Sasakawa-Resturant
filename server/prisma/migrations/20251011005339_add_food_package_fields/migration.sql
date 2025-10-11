-- AlterTable
ALTER TABLE "public"."ServiceRequest" ADD COLUMN     "packageName" TEXT,
ADD COLUMN     "pricePerPerson" DECIMAL(10,2),
ADD COLUMN     "selectedPackageId" TEXT;
