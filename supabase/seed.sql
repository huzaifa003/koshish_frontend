-- Optional Koshish sample data. Use only in a new/demo database.
begin;
delete from public.evidence;
delete from public.expenses;
delete from public.donations;
delete from public.projects;
insert into public.projects (id,slug,title,category,status,location,started_on,summary,description,goal_amount,beneficiaries,art) values
('00000000-0000-4000-8000-000000000001','ration-and-relief','Ration & Relief','Food security','active','Lahore','2021-03-12','Monthly groceries and emergency food support for families facing a difficult month.','Our longest-running initiative provides thoughtfully packed ration bags, with each distribution recorded against a family count and a verified expense.',1200000,860,'ration'),
('00000000-0000-4000-8000-000000000002','taleem-kits','Taleem Kits','Education','active','Lahore','2022-01-20','School bags, books, stationery and fee support that help children stay in class.','Taleem Kits helps children stay prepared for school with learning materials planned alongside local teachers.',650000,420,'education'),
('00000000-0000-4000-8000-000000000003','sehat-camps','Sehat Camps','Healthcare','completed','Multan','2023-06-10','Community check-ups, essential medicines and guided referrals for follow-up care.','A volunteer-led series of local health camps combining basic screening with access to a doctor.',480000,610,'health'),
('00000000-0000-4000-8000-000000000004','winter-warmth','Winter Warmth','Seasonal relief','completed','Lahore','2023-11-01','Blankets and warm clothing distributed through neighbourhood volunteers.','A seasonal response built around dignity and local knowledge, without exposing recipient identities.',350000,300,'winter'),
('00000000-0000-4000-8000-000000000005','clean-water','Clean Water','Water & sanitation','active','Kasur','2024-04-18','Water filters, storage and small community repairs for safer everyday access.','This initiative supports practical, maintainable water improvements with field notes and follow-up checks.',900000,740,'water'),
('00000000-0000-4000-8000-000000000006','flood-recovery','Flood Recovery','Emergency response','completed','Sindh','2025-08-02','Immediate essentials and recovery support for flood-affected households.','A time-bound emergency response for essential supplies and household recovery.',750000,380,'recovery');
insert into public.donations (id,received_on,amount,donor_name,is_name_public,source,method,project_id,reference,verified) values
('00000000-0000-4000-8000-000000001001','2021-03-15',180000,'',false,'Instagram','Bank transfer','00000000-0000-4000-8000-000000000001','KSH-D1',true),
('00000000-0000-4000-8000-000000001002','2021-11-10',120000,'',false,'Community fundraiser','Cash deposit','00000000-0000-4000-8000-000000000001','KSH-D2',true),
('00000000-0000-4000-8000-000000001003','2022-02-05',210000,'',false,'Instagram','Bank transfer','00000000-0000-4000-8000-000000000002','KSH-D3',true),
('00000000-0000-4000-8000-000000001004','2022-08-19',95000,'',false,'Website','JazzCash','00000000-0000-4000-8000-000000000002','KSH-D4',true),
('00000000-0000-4000-8000-000000001005','2023-05-28',260000,'',false,'Instagram','Bank transfer','00000000-0000-4000-8000-000000000003','KSH-D5',true),
('00000000-0000-4000-8000-000000001006','2023-07-14',110000,'Sample Community Partner',true,'Corporate partner','Bank transfer','00000000-0000-4000-8000-000000000003','KSH-D6',true),
('00000000-0000-4000-8000-000000001007','2023-12-02',185000,'',false,'Instagram','EasyPaisa','00000000-0000-4000-8000-000000000004','KSH-D7',true),
('00000000-0000-4000-8000-000000001008','2024-04-25',310000,'',false,'Website','Bank transfer','00000000-0000-4000-8000-000000000005','KSH-D8',true),
('00000000-0000-4000-8000-000000001009','2024-09-13',140000,'',false,'Community fundraiser','Cash deposit','00000000-0000-4000-8000-000000000005','KSH-D9',true),
('00000000-0000-4000-8000-000000001010','2025-08-06',400000,'',false,'Instagram','Bank transfer','00000000-0000-4000-8000-000000000006','KSH-D10',true),
('00000000-0000-4000-8000-000000001011','2025-09-18',175000,'Sample Local Business',true,'Corporate partner','Bank transfer','00000000-0000-4000-8000-000000000006','KSH-D11',true),
('00000000-0000-4000-8000-000000001012','2025-12-20',125000,'',false,'Website','JazzCash',null,'KSH-D12',true),
('00000000-0000-4000-8000-000000001013','2026-01-16',240000,'',false,'Instagram','Bank transfer','00000000-0000-4000-8000-000000000001','KSH-D13',true),
('00000000-0000-4000-8000-000000001014','2026-02-07',180000,'',false,'Website','EasyPaisa','00000000-0000-4000-8000-000000000002','KSH-D14',true),
('00000000-0000-4000-8000-000000001015','2026-03-22',320000,'',false,'Instagram','Bank transfer','00000000-0000-4000-8000-000000000005','KSH-D15',true),
('00000000-0000-4000-8000-000000001016','2026-05-11',150000,'Sample Community Partner',true,'Corporate partner','Bank transfer','00000000-0000-4000-8000-000000000003','KSH-D16',true),
('00000000-0000-4000-8000-000000001017','2026-07-03',205000,'',false,'Community fundraiser','Cash deposit','00000000-0000-4000-8000-000000000001','KSH-D17',true),
('00000000-0000-4000-8000-000000001018','2026-09-15',275000,'',false,'Instagram','Bank transfer','00000000-0000-4000-8000-000000000002','KSH-D18',true),
('00000000-0000-4000-8000-000000001019','2026-10-18',90000,'',false,'Website','JazzCash',null,'KSH-D19',true);
insert into public.expenses (id,spent_on,amount,category,vendor,description,project_id,reference,verified) values
('00000000-0000-4000-8000-000000002001','2021-04-02',135000,'Ration purchases','Sample Wholesale Supplier','Staples for the first monthly ration distribution.','00000000-0000-4000-8000-000000000001','EXP-E1',true),
('00000000-0000-4000-8000-000000002002','2021-12-01',85000,'Ration purchases','Sample Wholesale Supplier','Winter ration packing and essential groceries.','00000000-0000-4000-8000-000000000001','EXP-E2',true),
('00000000-0000-4000-8000-000000002003','2022-02-18',160000,'Education materials','Sample Book Depot','School bags, notebooks and term stationery.','00000000-0000-4000-8000-000000000002','EXP-E3',true),
('00000000-0000-4000-8000-000000002004','2022-09-01',70000,'School support','Sample Education Partner','Fee support and replacement learning materials.','00000000-0000-4000-8000-000000000002','EXP-E4',true),
('00000000-0000-4000-8000-000000002005','2023-06-18',190000,'Medical supplies','Sample Medical Supplier','Essential medicines and screening consumables.','00000000-0000-4000-8000-000000000003','EXP-E5',true),
('00000000-0000-4000-8000-000000002006','2023-07-22',75000,'Camp logistics','Sample Local Vendor','Camp equipment, transport and volunteer meals.','00000000-0000-4000-8000-000000000003','EXP-E6',true),
('00000000-0000-4000-8000-000000002007','2023-12-12',130000,'Winter supplies','Sample Textile Supplier','Blankets and warm clothing packs.','00000000-0000-4000-8000-000000000004','EXP-E7',true),
('00000000-0000-4000-8000-000000002008','2024-05-08',240000,'Water equipment','Sample Filter Works','Community water filters and installation parts.','00000000-0000-4000-8000-000000000005','EXP-E8',true),
('00000000-0000-4000-8000-000000002009','2024-10-04',100000,'Field implementation','Sample Field Services','Storage repairs and follow-up maintenance.','00000000-0000-4000-8000-000000000005','EXP-E9',true),
('00000000-0000-4000-8000-000000002010','2025-08-16',290000,'Emergency supplies','Sample Relief Supplier','Essential household and hygiene supplies.','00000000-0000-4000-8000-000000000006','EXP-E10',true),
('00000000-0000-4000-8000-000000002011','2025-09-25',120000,'Recovery support','Sample Recovery Partner','Household recovery grants and materials.','00000000-0000-4000-8000-000000000006','EXP-E11',true),
('00000000-0000-4000-8000-000000002012','2025-10-02',60000,'Transport','Sample Transport Co.','Emergency distribution transport and loading.','00000000-0000-4000-8000-000000000006','EXP-E12',true),
('00000000-0000-4000-8000-000000002013','2026-01-28',180000,'Ration purchases','Sample Wholesale Supplier','Monthly ration bags and packing materials.','00000000-0000-4000-8000-000000000001','EXP-E13',true),
('00000000-0000-4000-8000-000000002014','2026-02-20',125000,'Education materials','Sample Book Depot','New-term Taleem Kits and classroom supplies.','00000000-0000-4000-8000-000000000002','EXP-E14',true),
('00000000-0000-4000-8000-000000002015','2026-04-06',210000,'Water equipment','Sample Filter Works','Second-phase filters and community fittings.','00000000-0000-4000-8000-000000000005','EXP-E15',true),
('00000000-0000-4000-8000-000000002016','2026-05-20',85000,'Medical supplies','Sample Medical Supplier','Final reconciled health-camp medicine order.','00000000-0000-4000-8000-000000000003','EXP-E16',true),
('00000000-0000-4000-8000-000000002017','2026-07-12',60000,'Distribution','Sample Transport Co.','Ration distribution and volunteer transport.','00000000-0000-4000-8000-000000000001','EXP-E17',true);
commit;
