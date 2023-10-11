# KAHOOT_BACKEND


## Table of Contents
* [General Info](#general-information)
* [Video demo](#video-demo)
* [Team infor](#team-information)
* [Technologies Used](#technologies-used)
* [Features](#features)

* [Guideline](#guideline)
* [Database design](#database-design)
* [My role](#my-role)
* [Contact](#contact)
<!-- * [License](#license) -->


## General Information
- Xây dựng một web app có chức năng chính là quản lý nhóm và các bộ câu hỏi.
- Người dùng có thể tạo nhóm và mời người khác thông qua đường link trực tiếp hoặc gửi đường link đó qua email. Trong nhóm có phân thành viên thành các vai trò như owner, co-owner và member. Mỗi vai trò có một số quyền hạn nhất định.
- Ngoài ra, trang web còn cho phép người dùng tạo, chỉnh sửa và trình bày các bộ câu hỏi. Ứng dụng cung cấp cho người đa dạng các loại slide như multiple choice, heading và pagraph cho người dùng thoải mái lựa chọn. Chúng ta có thể mời cộng tác viên tham gia chỉnh sửa bài thuyết trình của mình thông qua tính năng Collaboration. Những bài thuyết trình sau khi đã được chuẩn bị xong có thể được đem đi trình chiếu ở dạng public (bất kì có mã phòng hoặc link mời đều có thể tham gia) hoặc ở dạng group (chỉ có những người có trong group được trình bày mới có thể tham gia).
## Video Demo
[click here](https://drive.google.com/file/d/1pl4s71rnL7HXt1zR-63X-U7ghihVDsIV/view?usp=share_link)
<!-- If you have screenshots you'd like to share, include them here. -->
## Team Information
MSSV | Tên
------------ | -------------
19120540 | Nguyễn Tuấn Khanh
19120047 | Trần Xuân An
19120588 | Phạm Duy Minh
## Technologies Used
- Frontend: ReactJs, Ant Design
- Backend: NodeJs, ExpressJs, Sequelize, socket.io
- Task Management: Jira

## Features
.No | Feature
------------ | -------------
1 | Authentication and Authorization
2 | Use a popular authentication library (use jwt)
3 | Social login Google, Facebook
4 | Register an account
5 | Account activation by email
6 | Restrict feature access based on the user’s role
7 | Forgot password and renew password by email
8 | Create group
9 | List groups
10 | Show the group owner, co-owners and list of members in the group
11 | promote a Member to Co-owner
12 | demote a Co-owner to Member
13 | kick members out of the group
14 | Create group invitation link and join a group by link
15 | Invite group member by email
16 | Owner can delete a group
17 | List presentations that yow own, or collaborate
18 | Create a new presentation
19 | Delete a presentation
20 | Manage Presenation collaborations (add, list, remove)
21 | Create/Edit slides
22 | Multiple Choice
23 | Paragraph
24 | Heading
25 | Realtime slideshow
26 | Public presentation
27 | Group presentation
28 | Show the presenting presentation in group details view
29 | Notify and update group details UI to all group members when a presentation is presenting in that group
30 | Owner and co-owner can change slide and the current slide is automatically updated on all viewers
31 | Viewers can submit choices at Multiple Choice slides
32 | Multiple choice result chart is automatically update and sync between viewers
33 | Owner and co-owner can view multiple choice result list
34 | Members can view chat messages 
35 | Add a new chat message
36 | Notify all viewers when there is a new chat message
37 | Show recent chat messages and scroll to load more
38 | View list of question
39 | Viewers can post questions
40 | Viewers can upvote questions
41 | Owner and co-owner can Mark question as answered
## Guideline
- Evironment Setup for Local: (Cả back-end và front-end)
+ Cài đặt NodeJS (nếu có bỏ qua).
+ Cài đặt Visual Studio Code (nếu có bỏ qua).
+ Clone code back-end và front-end.
+ Chuẩn bị Database bằng MongoDB Compass (xem hướng dẫn cụ thể trong folder "Database").
- Mở code bằng VS Code và chạy lần lượt các command:
+ Cài đặt các package cần thiết: "npm install" ( hoặc "npm install --force" nếu react-version không tương thích).
+ Chạy front-end và back-end bằng: "npm start".

## Database design
![image](https://github.com/TranXuanAn2803/KAHOOT_BACKEND/blob/main/database-er.png)



## My role

Feature | Role
------------ | -------------
Create group | handle both front-end taks and back-end tasks
List groups | handle both front-end taks and back-end tasks
Show the group owner, co-owners and list of members in the group | handle both front-end taks and back-end tasks
promote a Member to Co-owner | handle both front-end taks and back-end tasks
demote a Co-owner to Member | handle both front-end taks and back-end tasks
kick members out of the group | handle both front-end taks and back-end tasks
Create group invitation link and join a group by link | handle both front-end taks and back-end tasks
Invite group member by email | handle both front-end taks and back-end tasks
Owner can delete a group | handle both front-end taks and back-end tasks
List presentations that yow own, or collaborate | handle backend tasks
Create a new presentation | handle backend tasks
Delete a presentation | handle backend tasks
Manage Presenation collaborations (add, list, remove) | handle backend tasks
Create/Edit slides | handle backend tasks
Multiple Choice | handle backend tasks
Paragraph | handle backend task
Heading | handle backend tasks
Realtime slideshow | handle backend tasks
Public presentation | handle backend tasks
Group presentation | handle backend tasks
Show the presenting presentation in group details view | handle both front-end taks and back-end tasks
Notify and update group details UI to all group members when a presentation is presenting in that group | handle both front-end taks and back-end tasks
Owner and co-owner can change slide and the current slide is automatically updated on all viewers | handle backend tasks
Viewers can submit choices at Multiple Choice slides | handle backend tasks
Multiple choice result chart is automatically update and sync between viewers | handle backend tasks
Owner and co-owner can view multiple choice result list | handle backend tasks
Members can view chat messages |handle backend task
Add a new chat message | handle backend tasks
Notify all viewers when there is a new chat message | handle backend tasks
Show recent chat messages and scroll to load more | handle backend tasks
View list of question | handle backend tasks
Viewers can post questions | handle backend tasks
Viewers can upvote questions | handle backend tasks
Owner and co-owner can Mark question as answered | handle backend tasks



## Contact
Team representative [@tranxuanan](https://www.linkedin.com/in/tran-xuan-an-8b6174204/) - feel free to contact me!


<!-- Optional -->
<!-- ## License -->
<!-- This project is open source and available under the [... License](). -->

<!-- You don't have to include all sections - just the one's relevant to your project -->
