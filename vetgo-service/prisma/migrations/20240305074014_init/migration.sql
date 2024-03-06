-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('WAITING_PAYMENT', 'PARTIAL_PAYMENT', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('CASH', 'CARD', 'TRANSFER');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT NOT NULL,
    "firstname" TEXT,
    "lastName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderModel" (
    "id" TEXT NOT NULL,
    "code" TEXT,
    "branchId" TEXT NOT NULL,
    "customerId" TEXT,
    "discount" DOUBLE PRECISION,
    "isRatio" BOOLEAN,
    "discountRatio" DOUBLE PRECISION,
    "totalPayment" DOUBLE PRECISION,
    "userPayment" DOUBLE PRECISION,
    "includedInDebt" BOOLEAN,
    "method" "PaymentType" NOT NULL,
    "bankCode" TEXT,
    "bankNumber" TEXT,
    "soldById" TEXT NOT NULL,
    "soldByName" TEXT NOT NULL,
    "orderId" TEXT,
    "description" TEXT,
    "total" DOUBLE PRECISION,
    "createdDate" TEXT,
    "status" "OrderStatus",
    "customer" JSONB,
    "invoiceDetails" JSONB[],
    "retailer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderModel_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "OrderModel_code_key" ON "OrderModel"("code");

-- CreateIndex
CREATE INDEX "OrderModel_retailer_branchId_customerId_method_soldById_cre_idx" ON "OrderModel"("retailer", "branchId", "customerId", "method", "soldById", "createdDate", "status");
