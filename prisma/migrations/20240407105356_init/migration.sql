/*
  Warnings:

  - A unique constraint covering the columns `[seat_zone,seat_row,seat_number,event_id]` on the table `seats` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "seats_seat_zone_seat_row_seat_number_key";

-- CreateIndex
CREATE UNIQUE INDEX "seats_seat_zone_seat_row_seat_number_event_id_key" ON "seats"("seat_zone", "seat_row", "seat_number", "event_id");
