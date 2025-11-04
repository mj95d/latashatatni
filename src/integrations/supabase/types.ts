export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admin_notifications: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_read: boolean | null
          related_id: string | null
          related_table: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_read?: boolean | null
          related_id?: string | null
          related_table?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_read?: boolean | null
          related_id?: string | null
          related_table?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      admin_permissions: {
        Row: {
          admin_id: string
          can_delete: boolean | null
          can_read: boolean | null
          can_write: boolean | null
          created_at: string | null
          id: string
          permission_key: string
          updated_at: string | null
        }
        Insert: {
          admin_id: string
          can_delete?: boolean | null
          can_read?: boolean | null
          can_write?: boolean | null
          created_at?: string | null
          id?: string
          permission_key: string
          updated_at?: string | null
        }
        Update: {
          admin_id?: string
          can_delete?: boolean | null
          can_read?: boolean | null
          can_write?: boolean | null
          created_at?: string | null
          id?: string
          permission_key?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      app_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          setting_key: string
          setting_type: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key: string
          setting_type: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key?: string
          setting_type?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
          timestamp: string | null
          user_agent: string | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
          timestamp?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
          timestamp?: string | null
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          icon: string | null
          id: string
          name: string
          name_en: string | null
        }
        Insert: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name: string
          name_en?: string | null
        }
        Update: {
          created_at?: string | null
          icon?: string | null
          id?: string
          name?: string
          name_en?: string | null
        }
        Relationships: []
      }
      cities: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          name: string
          name_en: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name: string
          name_en?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          name_en?: string | null
        }
        Relationships: []
      }
      merchant_requests: {
        Row: {
          address: string | null
          business_description: string | null
          business_name: string
          city: string | null
          commercial_document: string | null
          created_at: string | null
          id: string
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          notes: string | null
          phone: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string | null
          user_id: string
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          business_description?: string | null
          business_name: string
          city?: string | null
          commercial_document?: string | null
          created_at?: string | null
          id?: string
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          notes?: string | null
          phone: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          business_description?: string | null
          business_name?: string
          city?: string | null
          commercial_document?: string | null
          created_at?: string | null
          id?: string
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          notes?: string | null
          phone?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      offers: {
        Row: {
          created_at: string | null
          description: string | null
          discount_percentage: number | null
          discount_text: string | null
          end_date: string | null
          id: string
          image_url: string | null
          images: Json | null
          is_active: boolean | null
          product_id: string | null
          start_date: string | null
          store_id: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          discount_text?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          images?: Json | null
          is_active?: boolean | null
          product_id?: string | null
          start_date?: string | null
          store_id?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          discount_text?: string | null
          end_date?: string | null
          id?: string
          image_url?: string | null
          images?: Json | null
          is_active?: boolean | null
          product_id?: string | null
          start_date?: string | null
          store_id?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          channel: string
          created_at: string
          customer_name: string
          customer_phone: string
          id: string
          is_demo: boolean
          items: Json
          notes: string | null
          status: string
          store_id: string | null
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          channel?: string
          created_at?: string
          customer_name: string
          customer_phone: string
          id?: string
          is_demo?: boolean
          items?: Json
          notes?: string | null
          status?: string
          store_id?: string | null
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          channel?: string
          created_at?: string
          customer_name?: string
          customer_phone?: string
          id?: string
          is_demo?: boolean
          items?: Json
          notes?: string | null
          status?: string
          store_id?: string | null
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          images: Json | null
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          old_price: number | null
          price: number | null
          sku: string | null
          stock_quantity: number | null
          store_id: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          old_price?: number | null
          price?: number | null
          sku?: string | null
          stock_quantity?: number | null
          store_id?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          old_price?: number | null
          price?: number | null
          sku?: string | null
          stock_quantity?: number | null
          store_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_status: string | null
          avatar_url: string | null
          city: string | null
          created_at: string | null
          deleted_at: string | null
          full_name: string | null
          id: string
          is_merchant: boolean | null
          last_login_at: string | null
          last_login_device: string | null
          last_login_ip: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          account_status?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          deleted_at?: string | null
          full_name?: string | null
          id: string
          is_merchant?: boolean | null
          last_login_at?: string | null
          last_login_device?: string | null
          last_login_ip?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          account_status?: string | null
          avatar_url?: string | null
          city?: string | null
          created_at?: string | null
          deleted_at?: string | null
          full_name?: string | null
          id?: string
          is_merchant?: boolean | null
          last_login_at?: string | null
          last_login_device?: string | null
          last_login_ip?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          rating: number | null
          store_id: string | null
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          store_id?: string | null
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          store_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          address: string | null
          approved: boolean
          category_id: string | null
          city_id: string | null
          commercial_document: string | null
          cover_url: string | null
          created_at: string | null
          description: string | null
          email: string | null
          id: string
          is_active: boolean | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          opening_hours: Json | null
          owner_id: string | null
          phone: string | null
          plan: string | null
          plan_expires_at: string | null
          product_limit: number | null
          rating: number | null
          reviews_count: number | null
          updated_at: string | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          approved?: boolean
          category_id?: string | null
          city_id?: string | null
          commercial_document?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          opening_hours?: Json | null
          owner_id?: string | null
          phone?: string | null
          plan?: string | null
          plan_expires_at?: string | null
          product_limit?: number | null
          rating?: number | null
          reviews_count?: number | null
          updated_at?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          approved?: boolean
          category_id?: string | null
          city_id?: string | null
          commercial_document?: string | null
          cover_url?: string | null
          created_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          opening_hours?: Json | null
          owner_id?: string | null
          phone?: string | null
          plan?: string | null
          plan_expires_at?: string | null
          product_limit?: number | null
          rating?: number | null
          reviews_count?: number | null
          updated_at?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stores_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stores_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stores_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_requests: {
        Row: {
          created_at: string | null
          duration: string
          id: string
          merchant_id: string | null
          notes: string | null
          payment_proof_url: string | null
          plan: string
          price: number
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          store_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration: string
          id?: string
          merchant_id?: string | null
          notes?: string | null
          payment_proof_url?: string | null
          plan: string
          price: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          store_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration?: string
          id?: string
          merchant_id?: string | null
          notes?: string | null
          payment_proof_url?: string | null
          plan?: string
          price?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          store_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscription_requests_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          plan_type: string
          start_date: string | null
          store_id: string | null
          subscription_request_id: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          plan_type: string
          start_date?: string | null
          store_id?: string | null
          subscription_request_id?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          plan_type?: string
          start_date?: string | null
          store_id?: string | null
          subscription_request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: true
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_subscription_request_id_fkey"
            columns: ["subscription_request_id"]
            isOneToOne: false
            referencedRelation: "subscription_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      tourism_places: {
        Row: {
          category: string | null
          city_id: string | null
          created_at: string | null
          description: string | null
          id: string
          images: Json | null
          latitude: number | null
          longitude: number | null
          name: string
        }
        Insert: {
          category?: string | null
          city_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          latitude?: number | null
          longitude?: number | null
          name: string
        }
        Update: {
          category?: string | null
          city_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: Json | null
          latitude?: number | null
          longitude?: number | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "tourism_places_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity: {
        Row: {
          activity_description: string | null
          activity_type: string
          created_at: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_description?: string | null
          activity_type: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_description?: string | null
          activity_type?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_orders: {
        Row: {
          admin_notes: string | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          customer_message: string
          customer_name: string | null
          customer_phone: string | null
          delivery_method: string | null
          id: string
          neighborhood: string | null
          offer_id: string | null
          product_id: string | null
          response_time_minutes: number | null
          source_page: string
          status: Database["public"]["Enums"]["order_status"]
          store_id: string | null
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          admin_notes?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          customer_message: string
          customer_name?: string | null
          customer_phone?: string | null
          delivery_method?: string | null
          id?: string
          neighborhood?: string | null
          offer_id?: string | null
          product_id?: string | null
          response_time_minutes?: number | null
          source_page: string
          status?: Database["public"]["Enums"]["order_status"]
          store_id?: string | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          admin_notes?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          customer_message?: string
          customer_name?: string | null
          customer_phone?: string | null
          delivery_method?: string | null
          id?: string
          neighborhood?: string | null
          offer_id?: string | null
          product_id?: string | null
          response_time_minutes?: number | null
          source_page?: string
          status?: Database["public"]["Enums"]["order_status"]
          store_id?: string | null
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_orders_offer_id_fkey"
            columns: ["offer_id"]
            isOneToOne: false
            referencedRelation: "offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_store_approved: { Args: { _store_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "merchant" | "user"
      order_status: "NEW" | "IN_PROGRESS" | "DONE" | "CANCELED"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "merchant", "user"],
      order_status: ["NEW", "IN_PROGRESS", "DONE", "CANCELED"],
    },
  },
} as const
