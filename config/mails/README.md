# Mail Templates

Mail Templates are created using mjml. The html version of mail templates are generated with
[mjml/build.sh](../mjml/build.sh). They are stored in `config/mails/[lang]/

DONT EDIT conig/mail/(de|en|fr)/*.html FILES. CHANGES ARE OVERWRITTEN.

## Mails

| Name                          | Description                                                   |
+-------------------------------+---------------------------------------------------------------+
| job-was-unpublished           | Mail send to the job owner after a job was unpublished.       |
| job-created-check             | Approve new job                                               |
| job-published                 | Mail send to the job owner after a job was  published.        |
| account-created               | Mail with validation link to the registered user              | 
| reset-password                | Reset Password link to registered user                        |
| application-created           | new Application created                                       |

the `account-created` and `reset-password` are copy&pasted into the
strapi backend.