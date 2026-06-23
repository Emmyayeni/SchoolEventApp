# Supabase Storage Setup Guide

To enable image uploads (Avatars, Event Images, and Announcements), you need to create the required storage buckets in your Supabase dashboard and set up the correct RLS (Row Level Security) policies.

## 1. Create Buckets
In your Supabase Dashboard, go to **Storage** and create the following three buckets:

1.  **`avatars`**: For user profile pictures.
2.  **`event-images`**: For event cover images.
3.  **`announcements`**: For announcement attachments/images.

> [!IMPORTANT]
> Make sure to set these buckets as **Public** when creating them.

## 2. Configure Row Level Security (RLS)

To secure the buckets and allow your app to upload images, you need to run the following SQL commands in the Supabase **SQL Editor**.

### Allow Public Read Access
Since the buckets are public, anyone should be able to view the images.

```sql
-- Allow public access to read files
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id in ('avatars', 'event-images', 'announcements') );
```

### Allow Authenticated Uploads
Only logged-in users should be able to upload files.

```sql
-- Allow authenticated users to upload files
create policy "Authenticated Users can upload"
  on storage.objects for insert
  with check (
    auth.role() = 'authenticated' AND
    bucket_id in ('avatars', 'event-images', 'announcements')
  );
```

### Allow Users to Update/Delete Their Own Files
Users should only be able to modify or delete the files they uploaded.

```sql
-- Allow users to update their own files
create policy "Users can update their own files"
  on storage.objects for update
  using (
    auth.uid() = owner AND
    bucket_id in ('avatars', 'event-images', 'announcements')
  );

-- Allow users to delete their own files
create policy "Users can delete their own files"
  on storage.objects for delete
  using (
    auth.uid() = owner AND
    bucket_id in ('avatars', 'event-images', 'announcements')
  );
```

## 3. That's It!
Once these buckets and policies are created, image uploads within the app (like profile pictures and event creations) will work seamlessly.
