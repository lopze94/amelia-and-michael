create table invitations (
  id text primary key not null,
  name_1 text not null check (length(trim(name_1)) > 0),
  name_2 text check (name_2 is null or length(trim(name_2)) > 0),
  guests integer not null check (guests > 0),
  confirmed_guests integer check (confirmed_guests is null or confirmed_guests between 0 and guests),
  confirmed_at text,
  check ((confirmed_guests is null) = (confirmed_at is null))
);
