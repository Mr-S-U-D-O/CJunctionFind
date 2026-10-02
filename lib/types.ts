export interface Profile {
  id: string;                    // uuid from auth.users
  full_name: string;
  employee_number: string;       // unique
  primary_store: string;
  secondary_stores?: string[] | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  name: string;                  // full product name e.g. "LDS S/S CHOC SIDE RUCHED CRINKLE BODYCON MAXI DRESS"
  long_code: string | null;      // e.g. "300630001"
  short_code: string | null;     // e.g. "FC7025"
  barcode: string | null;        // e.g. "2000001291962"
  size: string | null;
  colour: string | null;
  department: string | null;     // Ladies, Mens, Accessories, etc.
  price: number | null;          // current selling price
  original_price: number | null; // if marked down
  is_marked_down: boolean;
  is_on_flash: boolean;          // is it on this weekend's flash sale?
  photos: string[];              // array of storage paths / public URLs
  notes: string | null;
  added_by: string;              // profile id
  store_added: string;           // which store the item was added from
  created_at: string;
  updated_at: string;
}

export type ItemInsert = Omit<Item, 'id' | 'created_at' | 'updated_at'>;
export type ProfileInsert = Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
