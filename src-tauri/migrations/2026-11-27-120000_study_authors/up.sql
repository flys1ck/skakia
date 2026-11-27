create table study_authors (
    id integer primary key not null,
    study integer not null,
    position integer not null,
    name text not null check (length(trim(name)) > 0),
    title text check (title in ('GM', 'IM', 'FM', 'CM', 'WGM', 'WIM', 'WFM', 'WCM')),
    foreign key (study) references studies(id) on delete cascade,
    unique (study, position)
);

-- A title belongs to the person, so every study naming them shares the title saved last.
-- SQLite's recursive_triggers is off, so the update below doesn't fire the update trigger again.
create trigger study_authors_share_title_after_insert after insert on study_authors
begin
    update study_authors
    set title = new.title
    where lower(name) = lower(new.name) and id != new.id and title is not new.title;
end;

create trigger study_authors_share_title_after_update after update of name, title on study_authors
begin
    update study_authors
    set title = new.title
    where lower(name) = lower(new.name) and id != new.id and title is not new.title;
end;

alter table studies drop column description;
