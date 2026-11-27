alter table studies add column description text;

drop trigger study_authors_share_title_after_update;
drop trigger study_authors_share_title_after_insert;
drop table study_authors;
