# Endpoints

## Analytics

Analytics endpoints let you fetch a report based on a selected period and optional filters such as team inbox, users, labels, etc. Two endpoints are involved due to the asynchronous nature of generating reports: one request to create the report and another to get the data shortly after.

Example usage Automatically sync analytics data to your Business Intelligence tool.

### Create analytics report

`POST /v1/analytics/reports`

{% tabs %}
{% tab title="Simple" %}
{% code title="Request payload" %}

```json
{
  "reports": {
    "organization": "0d9bab85-a74f-4ece-9142-0f9b9f36ff92",
    "start": 1691812800,
    "end": 1692371867,
    "time_zone": "America/Montreal"
  }
}
```

{% endcode %}
{% endtab %}

{% tab title="With filters" %}
{% code title="Request payload" %}

```json
{
  "reports": {
    "organization": "0d9bab85-a74f-4ece-9142-0f9b9f36ff92",
    "start": 1691812800,
    "end": 1692371867,
    "time_zone": "America/Montreal",
    "teams": [
      "0e24f298-965d-4475-9220-b32636a1e2c3"
    ],
    "users": [
      "1ce8117e-ae42-4304-b953-c81656da4bd1",
      "74f91030-39b8-4627-9835-9cfbce9d67c1"
    ],
    "accounts": [
      "716be7a6-fd40-45a2-bfcb-43b9ed38d1f0",
      "a5d2aa1c-3828-4f90-bbd8-3dffaadda97e"
    ],
    "account_types": [
      "email",
      "sms"
    ],
    "shared_labels": [
      "bca0bb8f-8b2f-45f8-a59a-333de84f0184"
    ]
  }
}
```

{% endcode %}
{% endtab %}
{% endtabs %}

{% code title="Response" %}

```json
{
  "reports": {
    "id": "8441d4a0-a0ad-4f0f-aa9c-1cc881057e42"
  }
}
```

{% endcode %}

This id must then be included in a Get report request: <https://learn.missiveapp.com/api-documentation/rest-endpoints#get-report>

**Params**

| Name \* required | Description                                                                                            | Example                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------ |
| `organization`\* | Organization ID string                                                                                 | `"0d9bab85-a74f-4ece-9142-0f9b9f36ff92"`   |
| `start`\*        | Report period start                                                                                    | `1691812800`                               |
| `end`\*          | Report period end                                                                                      | `1692371867`                               |
| `time_zone`      | Time zone identifier ( [reference](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List)) | `"America/Montreal"`                       |
| `teams`          | Array of team ID strings                                                                               | `["0e24f298-965d-4475-9220-b32636a1e2c3"]` |
| `users`          | Array of user ID strings                                                                               | `["1ce8117e-ae42-4304-b953-c81656da4bd1"]` |
| `shared_labels`  | Array of organization label ID strings                                                                 | `["bca0bb8f-8b2f-45f8-a59a-333de84f0184"]` |
| `accounts`       | Array of account ID strings                                                                            | `["716be7a6-fd40-45a2-bfcb-43b9ed38d1f0"]` |
| `account_types`  | Array of type strings                                                                                  | `["email", "sms"]`                         |

`teams, users, shared_labels, accounts`\
Refer to Resource IDs: <https://learn.missiveapp.com/api-documentation/getting-started#resource-ids>

`account_types`\
`"custom"`, `"email"`, `"instagram"`, `"live_chat"`, `"messenger"`, `"sms"`, `"whatsapp"`

### Get analytics report

`GET /v1/analytics/reports/:id`

Fetch a report using its id returned by a Create report request.

Most reports complete within 2 or 3 seconds after creation, but some may take 30 seconds or more. They expire 60 seconds after completion. An empty 404 response is returned for incomplete, expired or inexistent reports.

{% hint style="info" %}
Fetch a report 5 seconds after its creation and retry every 5 seconds until a successful 200 response is returned.
{% endhint %}

***

## Contacts

Contact endpoints let you manage your contacts programmatically.

Example usage Automatically sync contacts between Missive and your CRM.

### Create contact(s)

`POST /v1/contacts`

{% code title="Request payload" %}

```json
{
  "contacts": [
    {
      "contact_book": "551b8675-11e9-49c3-aac0-01fb8510d862",
      "first_name": "Philippe",
      "last_name": "Lehoux",
      "starred": true,
      "infos": [
        {
          "kind": "phone_number",
          "label": "mobile",
          "value": "+1 518 777-7777"
        },
        {
          "kind": "email",
          "label": "home",
          "value": "philippe@missiveapp.com"
        }
      ],
      "memberships": [
        {
          "group": {
            "kind": "group",
            "name": "VIPs"
          }
        },
        {
          "title": "CEO",
          "location": "Quebec City",
          "group": {
            "kind": "organization",
            "name": "Missive"
          }
        }
      ]
    }
  ]
}
```

{% endcode %}

A successful request will return newly created contacts.

{% code title="Response" %}

```json
{
  "contacts": [
    {
      "id": "5960dcd2-3382-4430-aa70-955a2c62040a",
      "first_name": "Philippe",
      "last_name": "Lehoux",
      "starred": true,
      "contact_book": "db3767be-f506-4bd4-9e8f-b67afa332d44",
      "deleted": false,
      "modified_at": 1556201911,
      "infos": [
        {
          "kind": "email",
          "label": "home",
          "value": "philippe@missiveapp.com"
        },
        {
          "kind": "phone_number",
          "label": "mobile",
          "value": "+1 518 777-7777"
        }
      ],
      "memberships": [
        {
          "title": "CEO",
          "location": "Québec city",
          "group": {
            "id": "f8905b6f-2d13-466a-a2e6-8e3de090a6d1",
            "kind": "organization",
            "name": "Missive"
          }
        }
      ]
    }
  ]
}
```

{% endcode %}

**Attributes**

| Name \* required       | Description                                                        | Example                                                                       |
| ---------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| `contact_book`\*       | Contact book ID string                                             | `"551b8675-11e9-49c3-aac0-01fb8510d862"`                                      |
| `first_name`           | string                                                             | `"Philippe"`                                                                  |
| `last_name`            | string                                                             | `"Lehoux"`                                                                    |
| `middle_name`          | string                                                             | `"Antoine"`                                                                   |
| `phonetic_first_name`  | string                                                             | `"f ih l - IH - p ai"`                                                        |
| `phonetic_last_name`   | string                                                             | `"l ay h oo"`                                                                 |
| `phonetic_middle_name` | string                                                             | `"ah n t - w ah n"`                                                           |
| `prefix`               | string                                                             | `"Mr."`                                                                       |
| `suffix`               | string                                                             | `"Jr."`                                                                       |
| `nickname`             | string                                                             | `"Phil"`                                                                      |
| `file_as`              | string                                                             | `"Missive"`                                                                   |
| `notes`                | string                                                             | `"Cool prospect!"`                                                            |
| `starred`              | boolean                                                            | `true`                                                                        |
| `gender`               | string                                                             | `"Male"`                                                                      |
| `infos`                | Array containing contact info objects, see below for details       | `[{"kind": "email", "label": "work", "value": "phil@missiveapp.com"}]`        |
| `memberships`          | Array containing contact membership objects, see below for details | `[{ "title": "CEO", "group": { "kind": "organization", "name": "Missive" }}]` |

`infos`

The `infos` array lets you attach data of different kinds to contact: `email`, `twitter`, `phone_number`, `facebook`, `physical_address`, `url`, `custom`.

Infos with kind `email`

| Name \* required | Description                                                              | Example                     |
| ---------------- | ------------------------------------------------------------------------ | --------------------------- |
| `kind`\*         | string                                                                   | `"email"`                   |
| `value`\*        | Email address                                                            | `"philippe@missiveapp.com"` |
| `label`\*        | Email address type. Accepted values: `home`, `work`, `personal`, `other` | `"work"`                    |
| `custom_label`   | Custom label value, use only if `label` is `other`                       | `"old"`                     |

Infos with kind `phone_number`

| Name \* required | Description                                                                                                                 | Example             |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `kind`\*         | string                                                                                                                      | `"phone_number"`    |
| `value`\*        | Phone number                                                                                                                | `"+1 518 777-7777"` |
| `label`\*        | Phone number type. Accepted values: `main`, `mobile`, `home`, `work`, `home_fax`, `work_fax`, `other_fax`, `pager`, `other` | `"mobile"`          |
| `custom_label`   | Custom label value, use only if `label` is `other`                                                                          | `"old"`             |

Infos with kind `twitter`

| Name \* required | Description                                                        | Example      |
| ---------------- | ------------------------------------------------------------------ | ------------ |
| `kind`\*         | string                                                             | `"twitter"`  |
| `value`\*        | Twitter username                                                   | `"@plehoux"` |
| `label`\*        | Twitter account type. Accepted values: `work`, `personal`, `other` | `"personal"` |
| `custom_label`   | Custom label value, use only if `label` is `other`                 | `"old"`      |

Infos with kind `facebook`

| Name \* required | Description                                                         | Example                     |
| ---------------- | ------------------------------------------------------------------- | --------------------------- |
| `kind`\*         | string                                                              | `"facebook"`                |
| `name`\*         | Facebook user name                                                  | `"Philippe-Antoine Lehoux"` |
| `label`\*        | Facebook account type. Accepted values: `work`, `personal`, `other` | `"personal"`                |
| `custom_label`   | Custom label value, use only if `label` is `other`                  | `"old"`                     |

Infos with kind `physical_address`

| Name \* required   | Description                                            | Example              |
| ------------------ | ------------------------------------------------------ | -------------------- |
| `kind`\*           | string                                                 | `"physical_address"` |
| `street`           | string                                                 | `123 Fake Street`    |
| `extended_address` | string                                                 | `Office 222`         |
| `city`             | string                                                 | `Quebec`             |
| `region`           | string                                                 | `QC`                 |
| `postal_code`      | string                                                 | `G1K 3T4`            |
| `po_box`           | string                                                 | `PO#12345`           |
| `country`          | string                                                 | `Canada`             |
| `label`\*          | Address type. Accepted values: `work`, `home`, `other` | `"work"`             |
| `custom_label`     | Custom label value, use only if `label` is `other`     | `"old"`              |

Infos with kind `url`

| Name \* required | Description                                                                           | Example                     |
| ---------------- | ------------------------------------------------------------------------------------- | --------------------------- |
| `kind`\*         | string                                                                                | `"url"`                     |
| `value`\*        | URL                                                                                   | `"https://missiveapp.com/"` |
| `label`\*        | URL type. Accepted values: `homepage`, `profile`, `blog`, `work`, `personal`, `other` | `"homepage"`                |
| `custom_label`   | Custom label value, use only if `label` is `other`                                    | `"admin"`                   |

Infos with kind `custom`

| Name \* required | Description                                | Example            |
| ---------------- | ------------------------------------------ | ------------------ |
| `kind`\*         | string                                     | `"custom"`         |
| `value`\*        | string                                     | `"A custom value"` |
| `label`\*        | Custom info type. Accepted values: `other` | `"other"`          |
| `custom_label`   | Custom label value                         | `"custom"`         |

`memberships`

The `memberships` array lets you link a contact to organizations or groups. A membership always embeds a related `group`, which has a `kind` equal to either `group` or `organization`.

* Organizations are most often used to link contacts to their work location.
* Groups are used to group contacts together. Think of groups as labels.

| Name \* required | Description                                     | Example                                       |
| ---------------- | ----------------------------------------------- | --------------------------------------------- |
| `department`     | can be set if `group` is of kind `organization` | `"Finance"`                                   |
| `title`          | can be set if `group` is of kind `organization` | `"CFO"`                                       |
| `location`       | can be set if `group` is of kind `organization` | `"Montreal"`                                  |
| `description`    | can be set if `group` is of kind `organization` | `"Handle reporting"`                          |
| `group`\*        | Object, see below for details                   | `{"kind": "organization", "name": "Missive"}` |

`memberships.group`

| Name \* required | Description                                          | Example          |
| ---------------- | ---------------------------------------------------- | ---------------- |
| `kind`\*         | Group type. Accepted values: `organization`, `group` | `"organization"` |
| `name`\*         | string                                               | `"Missive"`      |

### Update contact(s)

`PATCH /v1/contacts/:id1,:id2,:id3,...`

A successful request will return the updated contacts with embedded `memberships` and `infos`.

{% code title="Request payload" %}

```json
{
  "contacts": [
    {
      "id": "ee31f156-db95-4158-923f-b26450e0dbf7",
      "last_name": "Lehoux"
    }
  ]
}
```

{% endcode %}

**Attributes**

Contact `id` is required. See the Create contact(s) section for other attributes. When updating a contact, you may pass only attributes you want to update. In the example above, only the last name will be updated.

{% hint style="warning" %}
The `infos` and `memberships` arrays are exceptions: when passed, you must include all items. Missing items will be deleted from the contact. To delete items, omit them from the array.
{% endhint %}

### List contacts

`GET /v1/contacts`

This endpoint is useful to sync Missive contacts to another service or to find contacts based on some search term.

{% code title="Response" %}

```json
{
  "contacts": [
    {
      "id": "183382b8-fb70-4a35-bf22-4ebae1450553",
      "first_name": "Arthur",
      "last_name": "Sto",
      "starred": false,
      "contact_book": "487bc080-6631-4edc-830e-1d114eef4ab0",
      "deleted": false,
      "modified_at": 1556200645
    },
    {
      "id": "862aceb8-3553-4644-9300-0312a432315f",
      "first_name": "Zeb",
      "last_name": "Craft",
      "starred": false,
      "contact_book": "487bc080-6631-4edc-830e-1d114eef4ab0",
      "deleted": false,
      "modified_at": 1556200644
    },
    {
      "id": "b40713e2-e790-4c67-9eb3-22e83bd1bdf9",
      "first_name": "Alex",
      "last_name": "Alstorm",
      "starred": false,
      "contact_book": "487bc080-6631-4edc-830e-1d114eef4ab0",
      "deleted": false,
      "modified_at": 1556200643,
      "infos": [
        {
          "kind": "phone_number",
          "label": "work",
          "value": "+1 (418) 717-1066"
        },
        {
          "kind": "custom",
          "custom_label": "Favorite food",
          "value": "Pizza"
        }
      ],
      "memberships": [
        {
          "title": "Project manager",
          "group": {
            "id": "522f8e19-0261-4f8b-b8b1-8d8bb4055569",
            "kind": "organization",
            "name": "Pagac Inc"
          }
        }
      ]
    }
  ]
}
```

{% endcode %}

**Params**

| Name \* required  | Default     | Description                                                                                                                                                                                                 |
| ----------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `contact_book`\*  |             | Contact book ID                                                                                                                                                                                             |
| `order`           | `last_name` | Default ordering is by contact last name. To get the most recently updated contacts, pass `last_modified`                                                                                                   |
| `limit`           | `50`        | Number of contacts returned. Max value: `200`                                                                                                                                                               |
| `offset`          | `0`         | Offset used to paginate.                                                                                                                                                                                    |
| `modified_since`  | `null`      | To return only contacts that have been modified or created since a point in time, pass a Unix Epoch time like `1556137749`.                                                                                 |
| `include_deleted` | `false`     | To include deleted contacts in the results of `modified_since` requests, pass `true`. Only the contact `id` and `deleted` attributes will be returned since the contact data has been deleted from Missive. |
| `search`          | `null`      | Text string to filter contacts. `search` term(s) are matched against all contact infos: name, email, phone, organization, custom fields, notes, etc.                                                        |

### Get a contact

`GET /v1/contacts/:id`

Fetch a specific contact using the contact `id`. Trying to get a deleted contact will produce a 404 response.

***

## Contact books

In Missive, contacts are stored in contact books. Contact books can be private or shared with various members of an organization.

### List contact books

`GET /v1/contact_books`

List contact books the authenticated user has access to. Remember that a contact book `id` is mandatory when creating a contact programmatically.

{% code title="Response" %}

```json
{
  "contact_books": [
    {
      "id": "6a012cec-c2e2-4e21-91e3-a36dba6930e7",
      "user": "0db31755-adcd-4c51-8346-66bb7194449e",
      "share_with_organization": true,
      "share_with_team": null,
      "share_with_users": [],
      "organization": "2b24d4f0-d082-41c7-9075-d2a34afcfcbd",
      "name": "HR",
      "description": null
    },
    {
      "id": "171ed616-bed2-4781-91b8-bf52459dd9e6",
      "user": "0db31755-adcd-4c51-8346-66bb7194449e",
      "share_with_organization": true,
      "share_with_team": null,
      "share_with_users": [],
      "organization": "2b24d4f0-d082-41c7-9075-d2a34afcfcbd",
      "name": "Production",
      "description": null
    },
    {
      "id": "108e216d-79f9-452c-93b9-4176213d4fdb",
      "user": "0db31755-adcd-4c51-8346-66bb7194449e",
      "share_with_organization": false,
      "share_with_team": null,
      "share_with_users": [],
      "organization": null,
      "name": "My personal book",
      "description": null
    }
  ]
}
```

{% endcode %}

**Params**

| Name \* required | Default | Description                                        |
| ---------------- | ------- | -------------------------------------------------- |
| `limit`          | `50`    | Number of contact books returned. Max value: `200` |
| `offset`         | `0`     | Offset used to paginate.                           |

***

## Contact groups

Contacts can be grouped in both organizations and groups. Organizations are typically used to map a group of related contacts (businesses). Groups are used to group unrelated contacts, think of groups as labels.

### List contact groups

`GET /v1/contact_groups`

List contact groups or organizations linked to a contact book.

{% code title="Response" %}

```json
{
  "contact_groups": [
    {
      "id": "6a012cec-c2e2-4e21-91e3-a36dba6930e7",
      "name": "VIPs"
    }
  ]
}
```

{% endcode %}

**Params**

| Name \* required | Default | Description                                         |
| ---------------- | ------- | --------------------------------------------------- |
| `contact_book`\* |         | Contact book ID                                     |
| `kind`\*         |         | Either `group` or `organization`.                   |
| `limit`          | `50`    | Number of contact groups returned. Max value: `200` |
| `offset`         | `0`     | Offset used to paginate.                            |

***

## Conversations

{% hint style="info" %}
**Managing conversation state (close, move, assign, etc.)**

There is no direct endpoint to update conversations (no `PATCH /v1/conversations/:id`). To close, move, assign, or modify conversations, use the [Posts](#posts), [Messages](#messages), or [Drafts](#drafts) endpoints with action parameters like `close`, `add_to_inbox`, or `add_assignees`.

Posts are the recommended approach for automations and integrations as they leave a visible trace showing what triggered the action.
{% endhint %}

### List conversations

`GET /v1/conversations`

List conversations visible to the user who owns the API token. Must be filtered by mailbox, shared label or team.

Returns conversations ordered from newest to oldest activity. To paginate, pass an `until` param equal to the `last_activity_at` of the oldest conversation returned in the previous page. The last page is reached when fewer conversations than `limit` are returned or if all conversations in a page have the same `last_activity_at`.

{% hint style="info" %}
A page may return more conversations than `limit`. Conversations where the API token user is a guest will be returned with limited data, containing only the `id` and `last_activity_at` fields.
{% endhint %}

{% code title="Response" %}

```json
{
  "conversations": [
    {
      "id": "6d3c9b1c-7067-4a28-8ea6-ea91340b67cc",
      "created_at": 1654544954,
      "subject": null,
      "latest_message_subject": "Question?",
      "organization": {
        "id": "96cafdc6-ec6a-4439-9b0c-f55a1133b1e7",
        "name": "Conference Badge"
      },
      "color": null,
      "assignees": [],
      "users": [
        {
          "id": "dc3c4104-eced-4206-b532-ef84b331778a",
          "name": "Chad Zemlak",
          "email": "chad@conferencebade.com",
          "unassigned": false,
          "closed": false,
          "archived": false,
          "trashed": false,
          "junked": false,
          "assigned": false,
          "flagged": true,
          "snoozed": false
        }
      ],
      "attachments_count": 0,
      "messages_count": 1,
      "authors": [
        {
          "name": "Samwise Gamgee",
          "address": "sam@fellowship.org"
        }
      ],
      "drafts_count": 0,
      "send_later_messages_count": 0,
      "tasks_count": 0,
      "completed_tasks_count": 0,
      "web_url": "https://mail.missiveapp.com/#inbox/conversations/6d3c9b1c-7067-4a28-8ea6-ea91340b67cc",
      "app_url": "missive://mail.missiveapp.com/#inbox/conversations/6d3c9b1c-7067-4a28-8ea6-ea91340b67cc",
      "assignee_names": "",
      "assignee_emails": "",
      "shared_label_names": "",
      "last_activity_at": 1654544954,
      "team": {
        "id": "f36b7570-078e-408e-9cb8-2b4441ad93c0",
        "name": "Team 1",
        "organization": "96cafdc6-ec6a-4439-9b0c-f55a1133b1e7"
      },
      "shared_labels": []
    }
  ]
}
```

{% endcode %}

**Params**

| Name           | Description                                                                                                                                                                   |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `limit`        | Number of conversations returned. Default: `25`. Max: `50`                                                                                                                    |
| `until`        | Timestamp value in Unix time used to paginate. Use the `last_activity_at` of the oldest conversation from previous page.                                                      |
| `inbox`        | Pass `true` to list conversations in the Inbox.                                                                                                                               |
| `all`          | Pass `true` to list conversations in the All mailbox.                                                                                                                         |
| `assigned`     | Pass `true` to list conversations assigned to the user.                                                                                                                       |
| `closed`       | Pass `true` to list conversations in Closed.                                                                                                                                  |
| `snoozed`      | Pass `true` to list conversations in Snoozed.                                                                                                                                 |
| `flagged`      | Pass `true` to list conversations in Starred.                                                                                                                                 |
| `trashed`      | Pass `true` to list conversations in Trash.                                                                                                                                   |
| `junked`       | Pass `true` to list conversations in Spam.                                                                                                                                    |
| `drafts`       | Pass `true` to list conversations in Drafts.                                                                                                                                  |
| `shared_label` | Shared label ID. List conversations in the shared label.                                                                                                                      |
| `team_inbox`   | Team ID. List conversations in the team’s Inbox.                                                                                                                              |
| `team_closed`  | Team ID. List conversations in the team’s Closed mailbox.                                                                                                                     |
| `team_all`     | Team ID. List conversations in the team’s All mailbox.                                                                                                                        |
| `organization` | Organization ID. Filter conversations to only those shared with the organization. There is no use to the `organization` param when passing a `shared_label` or `team_` param. |

### Get a conversation

`GET /v1/conversations/:id`

Fetch a specific conversation using the conversation `id`.

{% hint style="info" %}
The returned conversation may have a different `id`. This happens when conversations get merged; passing an old conversation `id` will keep working, but the new conversation `id` will be returned.
{% endhint %}

{% code title="Response" %}

```json
{
  "conversations": [
    {
      "id": "6d3c9b1c-7067-4a28-8ea6-ea91340b67cc",
      "subject": null,
      "latest_message_subject": "Question?",
      "organization": {
        "id": "96cafdc6-ec6a-4439-9b0c-f55a1133b1e7",
        "name": "Conference Badge"
      },
      "color": null,
      "assignees": [],
      "users": [
        {
          "id": "dc3c4104-eced-4206-b532-ef84b331778a",
          "name": "Chad Zemlak",
          "email": "chad@conferencebade.com",
          "unassigned": false,
          "closed": false,
          "archived": false,
          "trashed": false,
          "junked": false,
          "assigned": false,
          "flagged": true,
          "snoozed": false
        }
      ],
      "attachments_count": 0,
      "messages_count": 1,
      "authors": [
        {
          "name": "Samwise Gamgee",
          "address": "sam@fellowship.org"
        }
      ],
      "drafts_count": 0,
      "send_later_messages_count": 0,
      "tasks_count": 0,
      "completed_tasks_count": 0,
      "web_url": "https://mail.missiveapp.com/#inbox/conversations/6d3c9b1c-7067-4a28-8ea6-ea91340b67cc",
      "app_url": "missive://mail.missiveapp.com/#inbox/conversations/6d3c9b1c-7067-4a28-8ea6-ea91340b67cc",
      "assignee_names": "",
      "assignee_emails": "",
      "shared_label_names": "",
      "last_activity_at": 1654544954,
      "team": {
        "id": "f36b7570-078e-408e-9cb8-2b4441ad93c0",
        "name": "Team 1",
        "organization": "96cafdc6-ec6a-4439-9b0c-f55a1133b1e7"
      },
      "shared_labels": []
    }
  ]
}
```

{% endcode %}

### List conversation messages

`GET /v1/conversations/:id/messages`

List messages in the conversation passed as `id`. Draft messages are excluded.

Returns messages ordered from newest to oldest. To paginate, pass an `until` param equal to the `delivered_at` of the oldest message returned in the previous page. The last page is reached when fewer messages than `limit` are returned or if all messages in a page have the same `delivered_at`.

{% hint style="info" %}
A page may return more messages than `limit`.
{% endhint %}

{% code title="Response" %}

```json
{
  "messages": [
    {
      "id": "3fa4bcf5-e57e-47a4-9422-de2cce5f802e",
      "subject": "A Message",
      "draft": false,
      "preview": "A message from Sam",
      "type": "email",
      "delivered_at": 1563806347,
      "updated_at": 1563807320,
      "created_at": 1563807320,
      "email_message_id": "<0f1ab2d8-cd90-4dd1-a861-ef7e31fb3cdd@missiveapp.com>",
      "in_reply_to": [],
      "references": [],
      "from_field": {
        "name": "Samwise Gamgee",
        "address": "sam@fellowship.org"
      },
      "to_fields": [
        {
          "name": "Phil Smith",
          "address": "phil.smith@fakemail.com"
        }
      ],
      "cc_fields": [],
      "bcc_fields": [],
      "reply_to_fields": [],
      "attachments": [
        {
          "id": "81eed561-4908-4738-9a9f-2da886b1de43",
          "filename": "inline-image.png",
          "extension": "png",
          "url": "https://...",
          "media_type": "image",
          "sub_type": "png",
          "size": 114615,
          "width": 668,
          "height": 996
        }
      ]
    }
  ]
}
```

{% endcode %}

**Params**

| Name    | Description                                                                                                     |
| ------- | --------------------------------------------------------------------------------------------------------------- |
| `limit` | Number of messages returned. Default: `10`. Max: `10`                                                           |
| `until` | Timestamp value in Unix time used to paginate. Use the `delivered_at` of the oldest message from previous page. |

### List conversation comments

`GET /v1/conversations/:id/comments`

List comments in the conversation passed as `id`.

Returns comments ordered from newest to oldest. To paginate, pass an `until` param equal to the `created_at` of the oldest comment returned in the previous page. The last page is reached when fewer comments than `limit` are returned or if all comments in a page have the same `created_at`.

{% hint style="info" %}
A page may return more comments than `limit`.
{% endhint %}

{% code title="Response" %}

```json
{
  "comments": [
    {
      "id": "3fa4bcf5-e57e-47a4-9422-de2cce5f802e",
      "body": "This is a comment",
      "created_at": 1563806347,
      "mentions": [
        {
          "id": "1ce8117e-ae42-4304-b953-c81656da4bd1",
          "index": 0,
          "length": 8
        }
      ],
      "author": {
        "id": "dc3c4104-eced-4206-b532-ef84b331778a",
        "name": "Chad Zemlak",
        "email": "chad@example.com",
        "avatar_url": "https://..."
      },
      "attachment": {
        "id": "81eed561-4908-4738-9a9f-2da886b1de43",
        "filename": "document.pdf",
        "extension": "pdf",
        "url": "https://...",
        "media_type": "application",
        "sub_type": "pdf",
        "size": 114615
      },
      "task": {
        "description": "Follow up with client",
        "state": "in_progress",
        "due_at": 1692371867,
        "started_at": 1691812800,
        "closed_at": null,
        "assignees": [
          {
            "id": "1ce8117e-ae42-4304-b953-c81656da4bd1",
            "name": "Phil Smith",
            "email": "phil@example.com",
            "avatar_url": "https://..."
          }
        ],
        "team": {
          "id": "0e24f298-965d-4475-9220-b32636a1e2c3",
          "name": "Support",
          "organization": "0d9bab85-a74f-4ece-9142-0f9b9f36ff92"
        }
      }
    }
  ]
}
```

{% endcode %}

**Params**

| Name    | Description                                                                                                   |
| ------- | ------------------------------------------------------------------------------------------------------------- |
| `limit` | Number of comments returned. Default: `10`. Max: `10`                                                         |
| `until` | Timestamp value in Unix time used to paginate. Use the `created_at` of the oldest comment from previous page. |

Comment properties

| Name         | Description                                                                         |
| ------------ | ----------------------------------------------------------------------------------- |
| `id`         | Unique ID of the comment entry                                                      |
| `body`       | Text content of the comment                                                         |
| `created_at` | Timestamp when the comment was created                                              |
| `mentions`   | Array of user mentions in the comment, with indexes to locate them in the body text |
| `author`     | User who created the comment                                                        |
| `attachment` | Optional file attached to the comment                                               |
| `task`       | Task information if the comment is associated with a task, null otherwise           |

Task properties

The `task` object contains the following properties:

| Name          | Description                                                                  |
| ------------- | ---------------------------------------------------------------------------- |
| `description` | Detailed description of the task                                             |
| `state`       | Current state of the task: `todo`, `in_progress`, or `closed`                |
| `due_at`      | Unix timestamp for when the task is due                                      |
| `started_at`  | Unix timestamp for when work on the task began                               |
| `closed_at`   | Unix timestamp for when the task was completed/closed, null if not completed |
| `assignees`   | Array of users assigned to the task                                          |
| `team`        | Team associated with the task, if any                                        |

### List conversation drafts

`GET /v1/conversations/:id/drafts`

List draft messages in the conversation passed as `id`.

Returns drafts ordered from newest to oldest. To paginate, pass an `until` param equal to the `delivered_at` of the oldest draft returned in the previous page. The last page is reached when fewer drafts than `limit` are returned or if all drafts in a page have the same `delivered_at`.

{% hint style="info" %}
A page may return more drafts than `limit`.
{% endhint %}

{% code title="Response" %}

```json
{
  "drafts": [
    {
      "id": "3fa4bcf5-e57e-47a4-9422-de2cce5f802e",
      "subject": "Draft Message",
      "draft": true,
      "preview": "A draft message",
      "type": "email",
      "delivered_at": null,
      "updated_at": 1563807320,
      "created_at": 1563807320,
      "from_field": {
        "name": "Samwise Gamgee",
        "address": "sam@fellowship.org"
      },
      "to_fields": [
        {
          "name": "Phil Smith",
          "address": "phil.smith@fakemail.com"
        }
      ],
      "cc_fields": [],
      "bcc_fields": [],
      "reply_to_fields": [],
      "attachments": [],
      "author": {
        "id": "dc3c4104-eced-4206-b532-ef84b331778a",
        "name": "Chad Zemlak",
        "email": "chad@example.com",
        "avatar_url": "https://..."
      }
    }
  ]
}
```

{% endcode %}

**Params**

| Name    | Description                                                                                                   |
| ------- | ------------------------------------------------------------------------------------------------------------- |
| `limit` | Number of drafts returned. Default: `10`. Max: `10`                                                           |
| `until` | Timestamp value in Unix time used to paginate. Use the `delivered_at` of the oldest draft from previous page. |

### List conversation posts

`GET /v1/conversations/:id/posts`

List posts in the conversation passed as `id`.

Returns posts ordered from newest to oldest. To paginate, pass an `until` param equal to the `created_at` of the oldest post returned in the previous page. The last page is reached when fewer posts than `limit` are returned or if all posts in a page have the same `created_at`.

{% hint style="info" %}
A page may return more posts than `limit`.
{% endhint %}

{% code title="Response" %}

```json
{
  "posts": [
    {
      "id": "ee31f156-db95-4158-923f-b26450e0dbf7",
      "created_at": 1563806347,
      "username": "Missive",
      "username_icon": "https://s3.amazonaws.com/missive-assets/missive-avatar.png",
      "notification": {
        "title": "A title",
        "body": "A body"
      },
      "attachments": [
        {
          "author_name": "Philippe Lehoux",
          "author_link": "mailto:philippe@missiveapp.com",
          "author_icon": "avatar:philippe@missiveapp.com",
          "color": "#2266ED",
          "text": "New customer signed up!",
          "timestamp": 1511540318
        }
      ]
    }
  ]
}
```

{% endcode %}

**Params**

| Name    | Description                                                                                                |
| ------- | ---------------------------------------------------------------------------------------------------------- |
| `limit` | Number of posts returned. Default: `10`. Max: `10`                                                         |
| `until` | Timestamp value in Unix time used to paginate. Use the `created_at` of the oldest post from previous page. |

### Merge conversations

`POST /v1/conversations/:id/merge`

Merge the conversation passed as `:id` into the conversation passed as `target`. After merging, the source conversation (`:id`) is marked as replaced and all its messages, comments, and other entries become part of the target conversation.

{% hint style="info" %}
When conversations are swapped during the merge (e.g., when merging an organization conversation into a private conversation, or when the source has significantly more entries), the returned conversation `id` may differ from the one passed as `target`.
{% endhint %}

{% code title="Request" %}

```json
{
  "target": "3fa4bcf5-e57e-47a4-9422-de2cce5f802e",
  "subject": "Optional new subject"
}
```

{% endcode %}

{% code title="Response" %}

```json
{
  "conversations": [
    {
      "id": "6d3c9b1c-7067-4a28-8ea6-ea91340b67cc",
      "created_at": 1654544954,
      "subject": "Optional new subject",
      "latest_message_subject": "Question?",
      "organization": {
        "id": "96cafdc6-ec6a-4439-9b0c-f55a1133b1e7",
        "name": "Conference Badge"
      },
      "color": null,
      "assignees": [],
      "users": [
        {
          "id": "dc3c4104-eced-4206-b532-ef84b331778a",
          "name": "Chad Zemlak",
          "email": "chad@conferencebade.com",
          "unassigned": false,
          "closed": false,
          "archived": false,
          "trashed": false,
          "junked": false,
          "assigned": false,
          "flagged": true,
          "snoozed": false
        }
      ],
      "attachments_count": 0,
      "messages_count": 2,
      "authors": [
        {
          "name": "Samwise Gamgee",
          "address": "sam@fellowship.org"
        }
      ],
      "drafts_count": 0,
      "send_later_messages_count": 0,
      "tasks_count": 0,
      "completed_tasks_count": 0,
      "web_url": "https://mail.missiveapp.com/#inbox/conversations/6d3c9b1c-7067-4a28-8ea6-ea91340b67cc",
      "app_url": "missive://mail.missiveapp.com/#inbox/conversations/6d3c9b1c-7067-4a28-8ea6-ea91340b67cc",
      "assignee_names": "",
      "assignee_emails": "",
      "shared_label_names": "",
      "last_activity_at": 1654544954,
      "team": null,
      "shared_labels": []
    }
  ]
}
```

{% endcode %}

**Params**

| Name      | Description                                                                            |
| --------- | -------------------------------------------------------------------------------------- |
| `:id`     | **Required.** UUID of the source conversation (the one that gets merged and replaced). |
| `target`  | **Required.** UUID of the destination conversation (the one that survives).            |
| `subject` | Optional new subject for the merged conversation.                                      |

***

## Drafts

The drafts endpoint lets you create email, SMS, WhatsApp and Missive Live Chat drafts that can either be sent immediately or edited and sent from the Missive app. You can create drafts in a new conversation or append them as a reply to an existing one.

{% hint style="info" %}
**This is the endpoint to use for sending emails.** To send immediately, include `send: true` in your request. To reply to an existing conversation, use the `conversation` or `references` parameters.
{% endhint %}

{% hint style="info" %}
**Example usage:** Create a new draft in a shared label named "Follow up" with a specific body every time someone fills out a form on your website.
{% endhint %}

### Create a draft

`POST /v1/drafts`

{% code title="Request payload" %}

```json
{
  "drafts": {
    "subject": "Hello",
    "body": "World!",
    "to_fields": [
      {
        "address": "paul@acme.com"
      }
    ],
    "from_field": {
      "name": "Philippe Lehoux",
      "address": "philippe@missiveapp.com"
    }
  }
}
```

{% endcode %}

**Attributes**

| Name \* required                                                    | Description                                                                                                                                                                                                                                                                                                               | Example                                                                 |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `subject`                                                           | string                                                                                                                                                                                                                                                                                                                    | `"Hello"`                                                               |
| `body`                                                              | HTML or text string                                                                                                                                                                                                                                                                                                       | `"<b>World!</b>"`                                                       |
| `quote_previous_message`                                            | boolean                                                                                                                                                                                                                                                                                                                   | `false`                                                                 |
| `from_field` Email                                                  | Object with `"address"` and `"name"` keys.                                                                                                                                                                                                                                                                                | `{"address": "philippe@missiveapp.com", "name": "Philippe Lehoux"}`     |
| `from_field` SMS & WhatsApp                                         | Object with `"phone_number"` key, it must match an account number you have access to, formatted as `"+"` followed by digits only. An optional `"type"` key with values of `"signalwire"`, `"twilio"`, `"twilio_whatsapp"` or `"whatsapp"` needs to be provided when the phone number matches accounts of different types. | `{"phone_number": "+18005550199", "type": "whatsapp"}`                  |
| `from_field` Custom channel                                         | Object with `"id"`, `"username"` and `"name"` keys.                                                                                                                                                                                                                                                                       | `{"id": "12345", "username": "@missiveapp", "name": "Missive"}`         |
| `to_fields` Email                                                   | Array of objects. Object with `"address"` and `"name"` keys.                                                                                                                                                                                                                                                              | `[{"address": "philippe@missiveapp.com", "name": "Philippe Lehoux"}]`   |
| `to_fields` SMS & WhatsApp                                          | Array of objects. Object with `"phone_number"` key, only one item is allowed and it must be formatted as `"+"` followed by digits only.                                                                                                                                                                                   | `[{"phone_number": "+18005550199"}]`                                    |
| `to_fields` Messenger & Instagram                                   | Array of objects. Object with the `"id"` key.                                                                                                                                                                                                                                                                             | `[{"id": "1736313053102918"}]`                                          |
| `to_fields` Custom channel                                          | Array of objects. Object with `"id"`, `"username"` and `"name"` keys.                                                                                                                                                                                                                                                     | `[{"id": "12345", "username": "@missiveapp", "name": "Missive"}]`       |
| `to_fields` Missive Live Chat                                       | Array of one object. Object with `"id"`, `"username"` and `"name"` keys.                                                                                                                                                                                                                                                  | `[{ id: '123', username: 'phil@acme.com', name: 'Phil [Unverified]' }]` |
| `cc_fields`                                                         | Array of objects with `"address"` and `"name"` keys.                                                                                                                                                                                                                                                                      | `[{"address": "philippe@missiveapp.com", "name": "Philippe Lehoux"}]`   |
| `bcc_fields`                                                        | Array of objects with `"address"` and `"name"` keys.                                                                                                                                                                                                                                                                      | `[{"address": "philippe@missiveapp.com", "name": "Philippe Lehoux"}]`   |
| `account` Custom Channel & Missive Live Chat, Messenger & Instagram | Account ID. You can find this ID in the custom channel, Missive Live Chat settings or Settings > API > Resource IDs.                                                                                                                                                                                                      | `"fbf74c47-d0a0-4d77-bf3c-2118025d8102"`                                |
| `attachments`                                                       | Array containing files, see below for details                                                                                                                                                                                                                                                                             | `[{"base64_data": "iVBORw0KGgoAAAANS…", "filename": "logo.png"}]`       |
| `references`                                                        | Array of strings for appending to an existing conversation.                                                                                                                                                                                                                                                               | `["<some-reference-123>"]`                                              |
| `from_field`                                                        | Object with the `"phone_number"`, `"address"` or `"name"` keys, used to match contacts in the Missive sidebar and populate the authors line in the conversation preview                                                                                                                                                   | `{"phone_number": "+4187249887", "name": "Paul"}`                       |
| `conversation`                                                      | Conversation ID string for appending to an existing conversation                                                                                                                                                                                                                                                          | `"5bb24363-69e5-48ed-80a9-feee988bc953"`                                |
| `team`                                                              | Team ID string                                                                                                                                                                                                                                                                                                            | `"646bb7f1-2066-40be-b8f6-bacb8b3b7419"`                                |
| `force_team`                                                        | boolean                                                                                                                                                                                                                                                                                                                   | `false`                                                                 |
| `organization`                                                      | Organization ID string                                                                                                                                                                                                                                                                                                    | `"90beb742-27a3-44cf-95bc-7e5097167c9d"`                                |
| `add_users`                                                         | Array of user ID strings                                                                                                                                                                                                                                                                                                  | `["7343bccf-cf35-4b33-99b0-b1d3c69c5f5c"]`                              |
| `add_assignees`                                                     | Array of user ID strings                                                                                                                                                                                                                                                                                                  | `["7343bccf-cf35-4b33-99b0-b1d3c69c5f5c"]`                              |
| `conversation_subject`                                              | string                                                                                                                                                                                                                                                                                                                    | `"New user!"`                                                           |
| `conversation_color`                                                | HEX color code or `"good"` `"warning"` `"danger"` string                                                                                                                                                                                                                                                                  | `"#000"`, `"danger"`                                                    |
| `add_shared_labels`                                                 | Array of shared label ID strings                                                                                                                                                                                                                                                                                          | `["9825718b-3407-40b8-800d-a27361c86102"]`                              |
| `remove_shared_labels`                                              | Array of shared label ID strings                                                                                                                                                                                                                                                                                          | `["e4aae78f-e932-40a2-9ece-ed764aa85790"]`                              |
| `add_to_inbox`                                                      | boolean                                                                                                                                                                                                                                                                                                                   | `false`                                                                 |
| `add_to_team_inbox`                                                 | boolean                                                                                                                                                                                                                                                                                                                   | `false`                                                                 |
| `close`                                                             | boolean                                                                                                                                                                                                                                                                                                                   | `false`                                                                 |
| `send`                                                              | boolean                                                                                                                                                                                                                                                                                                                   | `false`                                                                 |
| `send_at`                                                           | Timestamp value in Unix time                                                                                                                                                                                                                                                                                              | `1684540565`                                                            |
| `auto_followup`                                                     | boolean, `send_at` is required when passing `true`                                                                                                                                                                                                                                                                        | `false`                                                                 |
| `external_response_id` WhatsApp                                     | The Twilio or Meta ID of the template you're using.                                                                                                                                                                                                                                                                       | `474808552386201`                                                       |
| `external_response_variables` WhatsApp                              | An object containing the variables values for the template you're using.                                                                                                                                                                                                                                                  | `{ "1": "Philippe", "2": "This awesome project" }`                      |

`body`

The HTML/text body of your message. Regular HTML paragraphs tags in Missive will not show the desired spacing.

For instance, to get the expected spacing in between paragraphs you would change this:

```
<p>Paragraph 1</p>
<p>Paragraph 2</p>
```

to:

```
<p>Paragraph 1</p>
<p><br></p>
<p>Paragraph 2</p>
<p><br></p>
```

`quote_previous_message`

When `true`, the draft will include a quoted version of the last message in the conversation.

{% hint style="danger" %}
Be extremely careful when using this parameter. If you're creating a draft in an existing conversation using `conversation` or `references`, the quoted content will include the previous message's body. This could potentially leak sensitive information if you're not certain about the content of the previous message. Only use this parameter when you have full control over and visibility into the conversation context.
{% endhint %}

`send`

Set to `true` to send the draft immediately upon creating it.

{% hint style="info" %}
**Outgoing rules trigger automatically.** When you send a message via the API with `send: true`, any matching outgoing message rules will run. This includes rules with **Schedule auto follow-up** actions, enabling automated email sequences. See [Automated email sequences](#use-case-automated-email-sequences) below.
{% endhint %}

`send_at`

Schedule draft to be sent at a later time. Cannot be combined with `send: true`.

`auto_followup`

When `auto_followup` is `true`, the scheduled draft to be sent at a later time with `send_at` will be discarded when there is a reply in the conversation.

`from_field`

`from_field` must either have an `address` that matches one of your email aliases on Missive, or a `phone_number` that matches one of your Twilio or SignalWire accounts. For custom channels, you may pass any `id`, `username` and `name` with no restriction.

`attachments`

The `attachments` array lets you attach up to 25 files to the draft. The total JSON payload of your request must not exceed 10 MB.

| Name \* required | Description                             | Example                |
| ---------------- | --------------------------------------- | ---------------------- |
| `base64_data`\*  | The base64-encoded contents of the file | `"iVBORw0KGgoAAAANS…"` |
| `filename`\*     | Filename of the attachment              | `"logo.png"`           |

`references`

The `references` array lets you append a draft to an existing conversation. Given a conversation already exists and includes an email with a `Message-ID: <a@a.com>` or `References: <a@a.com>` header, you may add `"references": ["<a@a.com>"]` to your request so the draft gets appended to that conversation.

If references passed in the request are related to more than one conversation, the draft will be appended to the first conversation found. If no reference is provided, the draft will be created in a new conversation. If one or more references are provided but none of them match an existing conversation, the draft will be created in a new conversation.

Chevrons around references are optional. Both `["<some-reference-123>"]` and `["some-reference-123"]` would reference the same conversation.

`conversation`

If you know the ID of an existing Missive conversation you want to create your draft into, you can pass it as `conversation` instead of using `references`.

`team`

`team` lets you link the draft’s conversation to a team. When a conversation is already linked to team, this field is ignored.

`force_team`

`force_team` lets you force a new team even if the conversation is already in another team.

`organization`

`organization` lets you scope the search for conversations to ones already associated with an organization. If a new conversation is created and `organization` is passed, the new conversation will be linked to that organization.

`add_users`

`add_users` determines users who will get access to the conversation. When providing `add_users`, the `organization` field is required.

`add_assignees`

`add_assignees` lets you assign users to the conversation. Existing assignees will remain assigned. When providing `add_assignees`, the `organization` field is required.

`add_shared_labels, remove_shared_labels`

`add_shared_labels` and `remove_shared_labels` let you manage shared labels that are applied to the draft’s conversation.

`add_to_team_inbox`

`add_to_team_inbox` lets you move the draft’s conversation to a team inbox. When providing `add_to_team_inbox`, the `team` field is required.

`add_to_inbox`

`add_to_inbox` lets you move the draft’s conversation to Inbox for everyone having access to the conversation.

`close`

`close` lets you close the draft’s conversation for everyone having access to the conversation.

`external_response_id, external_response_variables`

`external_response_id` and `external_response_variables` are used for WhatsApp templates. They are required if you're initiating a WhatsApp conversation with a user that you haven't previously interacted with for the past 24 hours.

`external_response_id` is the Twilio or Meta ID of the template you're using. You can find these in either Twilio Content Template Builder: <https://console.twilio.com/us1/develop/sms/content-template-builder> or WhatsApp Manager: <https://business.facebook.com/latest/whatsapp\\_manager/message\\_templates>

`external_response_variables` is an object where the keys are the placeholder in the template and the values are the content you want to use for said placeholder. Be sure to provide string keys for all of the variables.

{% hint style="warning" %}
When using a template, you will need to provide a `body` matching the result of the template interpolation in the draft payload. Missive will show the body value you've provided, but will send the template and variables to the appropriate provider.
{% endhint %}

### Send a message

To send a new message or reply, use Create a draft with the `send: true` param.

{% code title="Request payload" %}

```json
{
  "drafts": {
    "send": true,
    "subject": "Hello",
    "body": "World!",
    "to_fields": [
      {
        "address": "paul@acme.com"
      }
    ],
    "from_field": {
      "address": "philippe@missiveapp.com"
    }
  }
}
```

{% endcode %}

### Use case: Automated email sequences

Combine the API with [automatic follow-up rules](https://missiveapp.com/docs/advanced-features/rules/templates/automatic-follow-ups) to create drip campaigns triggered by external events (e.g., form submissions, CRM updates).

**How it works:**

1. Create an outgoing message rule with **Schedule auto follow-up** actions that triggers on a specific phrase in your email body
2. Use the API to send the initial email containing that trigger phrase
3. The rule automatically schedules follow-up emails (e.g., 1, 3, and 7 days later)
4. If the recipient replies, remaining scheduled follow-ups are discarded

**Example: Website form triggers email sequence**

{% code title="Request payload" %}

```json
{
  "drafts": {
    "send": true,
    "subject": "Thanks for your interest!",
    "body": "Hi! Here is the quote you requested...",
    "to_fields": [{ "address": "lead@example.com" }],
    "from_field": { "address": "sales@yourcompany.com" }
  }
}
```

{% endcode %}

The phrase "Here is the quote you requested" triggers your auto-follow-up rule, which schedules the sequence of follow-up emails.

### Delete a draft

`DELETE /v1/drafts/:id`

Deletes a draft from a conversation. The `:id` parameter is the ID of the draft (returned in the create draft response).

***

## Messages

### Create a message

`POST /v1/messages`

Create an incoming message in a custom channel. Custom channels let users integrate message providers not built-in to Missive.

{% hint style="warning" %}
This endpoint is only for **custom channels**. It creates incoming messages (simulating messages received from an external system).

**To reply to an email or send a new email**, use the [Drafts endpoint](#drafts) with `send: true` instead.
{% endhint %}

{% code title="Request payload" %}

```json
{
  "messages": {
    "account": "fbf74c47-d0a0-4d77-bf3c-2118025d8102",
    "from_field": {
      "id": "12345",
      "username": "@philippe",
      "name": "Philippe Lehoux"
    },
    "to_fields": [
      {
        "id": "54321",
        "username": "@missiveapp",
        "name": "Missive"
      }
    ],
    "body": "Hello <b>world</b>!"
  }
}
```

{% endcode %}

**Attributes**

| Name \* required       | Description                                                                                                                                             | Example                                                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `account`\*            | Account ID. You can find this ID in the custom channel settings.                                                                                        | `"fbf74c47-d0a0-4d77-bf3c-2118025d8102"`                                                                                                       |
| `subject`              | Email channel only: string                                                                                                                              | `"Hello"`                                                                                                                                      |
| `body`                 | HTML or text string based on channel message type.                                                                                                      | `"<b>World!</b>"`                                                                                                                              |
| `from_field`           | Email channel: Object with `"address"` and `"name"` keys. Text or HTML channel: Object with `"id"`, `"username"` and `"name"` keys.                     | `{ "address": "philippe@missiveapp.com", "name": "Philippe Lehoux" }` or `{ "id": "12345", "username": "@missiveapp", "name": "Missive" }`     |
| `to_fields`            | Email channel: Array of objects with `"address"` and `"name"` keys. Text or HTML channel: Array of objects with `"id"`, `"username"` and `"name"` keys. | `[{ "address": "philippe@missiveapp.com", "name": "Philippe Lehoux" }]` or `[{ "id": "12345", "username": "@missiveapp", "name": "Missive" }]` |
| `cc_fields`            | Email channel only: Array of objects with `"address"` and `"name"` keys.                                                                                | `[{ "address": "philippe@missiveapp.com", "name": "Philippe Lehoux" }]`                                                                        |
| `bcc_fields`           | Email channel only: Array of objects with `"address"` and `"name"` keys.                                                                                | `[{ "address": "philippe@missiveapp.com", "name": "Philippe Lehoux" }]`                                                                        |
| `delivered_at`         | Message delivery timestamp. If omitted, message is marked as delivered at request time.                                                                 | `1563806347`                                                                                                                                   |
| `attachments`          | Array containing files, see below for details.                                                                                                          | `[{ "base64_data": "iVBORw0KGgoAAAANS...", "filename": "logo.png" }]`                                                                          |
| `external_id`          | Unique ID used to identify non-email messages (SMS, Instagram DMs, etc).                                                                                | `"some-id-123"`                                                                                                                                |
| `references`           | Array of strings for appending to an existing conversation.                                                                                             | `["some-reference-123"]`                                                                                                                       |
| `conversation`         | Conversation ID string for appending to an existing conversation                                                                                        | `"5bb24363-69e5-48ed-80a9-feee988bc953"`                                                                                                       |
| `team`                 | Team ID string                                                                                                                                          | Default based on channel sharing settings: Inbox or Team Inbox                                                                                 |
| `force_team`           | boolean                                                                                                                                                 | `false`                                                                                                                                        |
| `organization`         | Organization ID string                                                                                                                                  | `"90beb742-27a3-44cf-95bc-7e5097167c9d"`                                                                                                       |
| `add_users`            | Array of user ID strings                                                                                                                                | `["7343bccf-cf35-4b33-99b0-b1d3c69c5f5c"]`                                                                                                     |
| `add_assignees`        | Array of user ID strings                                                                                                                                | `["7343bccf-cf35-4b33-99b0-b1d3c69c5f5c"]`                                                                                                     |
| `conversation_subject` | string                                                                                                                                                  | `"New user!"`                                                                                                                                  |
| `conversation_color`   | HEX color code or `"good"` `"warning"` `"danger"` string                                                                                                | `"#000"`, `"danger"`                                                                                                                           |
| `add_shared_labels`    | Array of shared label ID strings                                                                                                                        | `["9825718b-3407-40b8-800d-a27361c86102"]`                                                                                                     |
| `remove_shared_labels` | Array of shared label ID strings                                                                                                                        | `["e4aae78f-e932-40a2-9ece-ed764aa85790"]`                                                                                                     |
| `add_to_inbox`         | boolean                                                                                                                                                 | Default based on channel sharing settings: Inbox or Team Inbox                                                                                 |
| `add_to_team_inbox`    | boolean                                                                                                                                                 | Default based on channel sharing settings: Inbox or Team Inbox                                                                                 |
| `close`                | boolean                                                                                                                                                 | `false`                                                                                                                                        |

`attachments`

The `attachments` array lets you attach files to messages. The total JSON payload of your request must not exceed 10 MB.

| Name \* required | Description                             | Example                  |
| ---------------- | --------------------------------------- | ------------------------ |
| `base64_data`\*  | The base64-encoded contents of the file | `"iVBORw0KGgoAAAANS..."` |
| `filename`\*     | Filename of the attachment              | `"logo.png"`             |

`references`

The `references` array lets you append a message to an existing conversation. Given a conversation already exists and includes a message with `external_id: "some-id-123"` or `references: ["some-id-123"]`, you may add `"references": ["some-id-123"]` to your request so the message gets appended to that conversation.

If references passed in the request are related to more than one conversation, the message will be appended to the first conversation found. If no reference is provided, the message will be created in a new conversation. If one or more references are provided but none of them match an existing conversation, the message will be created in a new conversation.

`conversation`

If you know the ID of an existing Missive conversation you want to create your message into, you can pass it as `conversation` instead of using `references`.

`team`

`team` lets you link the message’s conversation to a team. When a conversation is already linked to team, this field is ignored.

`force_team`

`force_team` lets you force a new team even if the conversation is already in another team.

`organization`

`organization` lets you scope the search for conversations to ones already associated with an organization. If a new conversation is created and `organization` is passed, the message will be linked to that organization.

`add_users`

`add_users` determines users who will get access to the conversation. When providing `add_users`, the `organization` field is required.

`add_assignees`

`add_assignees` lets you assign users to the conversation. Existing assignees will remain assigned. When providing `add_assignees`, the `organization` field is required.

`add_shared_labels, remove_shared_labels`

`add_shared_labels` and `remove_shared_labels` let you manage shared labels that are applied to the message’s conversation.

`add_to_team_inbox`

`add_to_team_inbox` lets you move the message’s conversation to a team inbox. When providing `add_to_team_inbox`, the `team` field is required.

`add_to_inbox`

`add_to_inbox` lets you move the message’s conversation to Inbox for everyone having access to the conversation.

`close`

`close` lets you close the message’s conversation for everyone having access to the conversation.

### Get a Message

`GET /v1/messages/:id`

Fetch a specific message headers, body and attachments using the message `id`.

{% code title="Response" %}

```json
{
  "messages": {
    "id": "3fa4bcf5-e57e-47a4-9422-de2cce5f802e",
    "subject": "A Message",
    "preview": "A message from Sam",
    "type": "email",
    "delivered_at": 1563806347,
    "updated_at": 1563807320,
    "created_at": 1563807320,
    "email_message_id": "<0f1ab2d8-cd90-4dd1-a861-ef7e31fb3cdd@missiveapp.com>",
    "in_reply_to": [],
    "references": [],
    "body": "<div>A message from Sam</div><br><img style=\"max-width: 100%\" alt=\"inline-image.png\" data-missive-attachment-id=\"81eed561-4908-4738-9a9f-2da886b1de43\">",
    "from_field": {
      "name": "Samwise Gamgee",
      "address": "sam@fellowship.org"
    },
    "to_fields": [
      {
        "name": "Phil Smith",
        "address": "phil.smith@fakemail.com"
      }
    ],
    "cc_fields": [],
    "bcc_fields": [],
    "reply_to_fields": [],
    "attachments": [
      {
        "id": "81eed561-4908-4738-9a9f-2da886b1de43",
        "filename": "inline-image.png",
        "extension": "png",
        "url": "https://...",
        "media_type": "image",
        "sub_type": "png",
        "size": 114615,
        "width": 668,
        "height": 996
      }
    ],
    "conversation": {
      "id": "47a57b76-df42-4d8k-927x-80dbe5d87191",
      "subject": null,
      "latest_message_subject": "A Message",
      "organization": {
        "id": "93e5e5d5-11a2-4c9b-80b8-94f3c08068cf",
        "name": "Fellowship"
      },
      "team": {
        "id": "2f618f9e-d3d4-4a01-b7d5-57124ab366b8",
        "name": "Hobbits",
        "organization": "93e5e5d5-11a2-4c9b-80b8-94f3c08068cf"
      },
      "color": null,
      "assignees": [
        {
          "id": "6b52b6b9-9b51-46ad-a4e3-82ef3c45512c",
          "name": "Frodo Baggins",
          "email": "frodo@fellowship.org",
          "unassigned": false,
          "closed": false,
          "archived": false,
          "trashed": false,
          "junked": false,
          "assigned": true,
          "flagged": false,
          "snoozed": true
        }
      ],
      "assignee_names": "Frodo Baggins",
      "assignee_emails": "frodo@fellowship.org",
      "users": [
        {
          "id": "6b52b6b9-9b51-46ad-a4e3-82ef3c45512c",
          "name": "Frodo Baggins",
          "email": "frodo@fellowship.org",
          "unassigned": false,
          "closed": false,
          "archived": false,
          "trashed": false,
          "junked": false,
          "assigned": true,
          "flagged": false,
          "snoozed": true
        }
      ],
      "attachments_count": 0,
      "messages_count": 1,
      "authors": [
        {
          "name": "Samwise Gamgee",
          "address": "sam@fellowship.org"
        }
      ],
      "drafts_count": 0,
      "send_later_messages_count": 0,
      "tasks_count": 0,
      "completed_tasks_count": 0,
      "shared_labels": [
        {
          "id": "146ff5c4-d5la-3b63-b994-76711fn790lq",
          "name": "Elfs"
        }
      ],
      "shared_label_names": "Elfs",
      "app_url": "missive://mail.missiveapp.com/#inbox/conversations/47a57b76-df42-4d8k-927x-80dbe5d87191",
      "web_url": "https://mail.missiveapp.com/#inbox/conversations/47a57b76-df42-4d8k-927x-80dbe5d87191"
    }
  }
}
```

{% endcode %}

Inline images

Inline images markup in the message `body` HTML contain no `src` attribute, instead they contain a `data-missive-attachment-id` attribute with the attachment `id`. The attachment and its URL are available in the GET response under the `attachments` key.

### List messages

`GET /v1/messages?email_message_id=Message-ID`

Fetch messages matching an email `Message-ID`.

{% code title="Response" %}

```json
{
  "messages": [
    {
      // Latest message
    },
    {
      // Second-latest message
    }
  ]
}
```

{% endcode %}

Message data includes headers, body and attachments in the same format as Get a message.

Most of the time, only one message matches a given Message-ID, as required by email standards. However, non-compliant sender servers may send you multiple messages with the same Message-ID in which case this endpoint will return the latest 10.

**Params**

| Name \* required     | Default | Description                                  |
| -------------------- | ------- | -------------------------------------------- |
| `email_message_id`\* | \`\`    | The `Message-ID` found in an email’s header. |

***

## Organizations

### List organizations

`GET /v1/organizations`

List organizations the authenticated user is part of.

{% code title="Response" %}

```json
{
  "organizations": [
    {
      "id": "0d9bab85-a74f-4ece-9142-0f9b9f36ff92",
      "name": "Conference Badge"
    }
  ]
}
```

{% endcode %}

**Params**

| Name \* required | Default | Description                                        |
| ---------------- | ------- | -------------------------------------------------- |
| `limit`          | `50`    | Number of organizations returned. Max value: `200` |
| `offset`         | `0`     | Offset used to paginate.                           |

***

## Responses

### List responses

`GET /v1/responses`

List responses for the authenticated user.

{% code title="Response" %}

```json
{
  "responses": [
    {
      "id": "75ad834a-9bd6-4008-b9e6-fc9fa2e7770b",
      "title": "A test response",
      "body": "<div>Inline image: <img alt=\"\" title=\"\" width=\"288\" data-missive-attachment-id=\"66d17982-4c83-4e13-a9c5-83cf6065b3da\" data-missive-resizable-image=\"true\" data-missive-image-resolution=\"144\" style=\"max-width: 100%\"></div>",
      "subject": null,
      "organization": "84f876cc-ef7c-41cd-9711-7ab9cf9f26a5",
      "user": null,
      "share_with_team": null,
      "modified_at": 1700150379,
      "to_fields": [],
      "cc_fields": [],
      "bcc_fields": [],
      "shared_labels": ["93f876cc-ef7c-42cd-9711-7ab9cf9f26a4"],
      "attachments": [
        {
          "id": "66d17982-4c83-4e13-a9c5-83cf6065b3da",
          "filename": "image.png",
          "extension": "png",
          "url": "...",
          "media_type": "image",
          "sub_type": "png",
          "size": 99,
          "width": 100,
          "height": 100
        }
      ]
    }
  ]
}
```

{% endcode %}

**Params**

| Name \* required | Default | Description                                    |
| ---------------- | ------- | ---------------------------------------------- |
| `organization`   | `null`  | Organization ID                                |
| `limit`          | `50`    | Number of responses returned. Max value: `200` |
| `offset`         | `0`     | Offset used to paginate.                       |

Inline images

Inline images markup in the response `body` HTML contain no `src` attribute, instead they contain a `data-missive-attachment-id` attribute with the attachment `id`. The attachment and its URL are available in the GET response under the `attachments` key.

### Get a response

`GET /v1/responses/:id`

Fetch a specific response using the response `id`.

### Create response(s)

`POST /v1/responses`

{% code title="Request payload" %}

```json
{
  "responses": [
    {
      "title": "Welcome email template",
      "body": "<p>Welcome to our service!</p>",
      "organization": "0d9bab85-a74f-4ece-9142-0f9b9f36ff92",
      "subject": "Welcome!",
      "external_id": "template-001",
      "external_source": "knowledge-base"
    }
  ]
}
```

{% endcode %}

A successful request will return newly created responses.

{% code title="Response" %}

```json
{
  "responses": [
    {
      "id": "75ad834a-9bd6-4008-b9e6-fc9fa2e7770b",
      "title": "Welcome email template",
      "body": "<p>Welcome to our service!</p>",
      "subject": "Welcome!",
      "organization": "0d9bab85-a74f-4ece-9142-0f9b9f36ff92",
      "user": null,
      "share_with_team": null,
      "modified_at": 1700150379,
      "to_fields": [],
      "cc_fields": [],
      "bcc_fields": [],
      "shared_labels": [],
      "external_id": "template-001",
      "external_source": "knowledge-base",
      "attachments": []
    }
  ]
}
```

{% endcode %}

**Attributes**

| Name \* required  | Description                                                                                                                        | Example                                                             |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `title`           | Response title string (max 500 characters)                                                                                         | `"Welcome email template"`                                          |
| `organization`    | Organization ID string. Either `organization` or `user` is required (but not both).                                                | `"0d9bab85-a74f-4ece-9142-0f9b9f36ff92"`                            |
| `user`            | User ID string for personal responses. Either `organization` or `user` is required (but not both).                                 | `"a41a00fd-453d-49d7-a487-9765c35a3b70"`                            |
| `body`            | HTML string containing the response content                                                                                        | `"<p>Hello!</p>"`                                                   |
| `subject`         | Subject line string (max 500 characters)                                                                                           | `"Welcome!"`                                                        |
| `share_with_team` | Team ID string to share the response with a specific team. `organization` is required                                              | `"646bb7f1-2066-40be-b8f6-bacb8b3b7419"`                            |
| `shared_labels`   | Array of shared label ID strings. `organization` is required                                                                       | `["9825718b-3407-40b8-800d-a27361c86102"]`                          |
| `to_fields`       | Array of objects with `"address"` and `"name"` keys                                                                                | `[{"address": "support@example.com", "name": "Support"}]`           |
| `cc_fields`       | Array of objects with `"address"` and `"name"` keys                                                                                | `[{"address": "manager@example.com", "name": "Manager"}]`           |
| `bcc_fields`      | Array of objects with `"address"` and `"name"` keys                                                                                | `[{"address": "archive@example.com"}]`                              |
| `external_id`     | External identifier string for syncing with other systems. When provided, `external_source` is required.                           | `"template-001"`                                                    |
| `external_source` | Source system identifier string. Required when `external_id` is provided. The combination must be unique per organization or user. | `"knowledge-base"`                                                  |
| `attachments`     | Array containing files, see below for details                                                                                      | `[{"base64_data": "iVBORw0KGgoAAAANS...", "filename": "logo.png"}]` |

`attachments`

The `attachments` array lets you attach files to the response. The total JSON payload of your request must not exceed 10 MB.

| Name \* required | Description                                                                | Example                  |
| ---------------- | -------------------------------------------------------------------------- | ------------------------ |
| `base64_data`\*  | The base64-encoded contents of the file                                    | `"iVBORw0KGgoAAAANS..."` |
| `filename`\*     | Filename of the attachment                                                 | `"logo.png"`             |
| `id`             | Temporary ID for inline image references (see Inline images section below) | `"img1"`                 |

Inline images

To embed images inline within the response body, use a temporary `id` in the attachment and reference it in the HTML using the `data-missive-attachment-id` attribute:

{% code title="Request payload" %}

```json
{
  "responses": [
    {
      "title": "Response with inline image",
      "organization": "0d9bab85-a74f-4ece-9142-0f9b9f36ff92",
      "body": "<p>See our logo:</p><p><img data-missive-attachment-id=\"logo-img\" style=\"max-width: 100%\" /></p>",
      "attachments": [
        {
          "id": "logo-img",
          "filename": "logo.png",
          "base64_data": "iVBORw0KGgoAAAANS..."
        }
      ]
    }
  ]
}
```

{% endcode %}

The server will replace the temporary `id` with the actual attachment UUID. Attachments with an `id` that is referenced in the body HTML will be treated as inline images; attachments without a reference in the body will be treated as regular attachments.

### Update response(s)

`PATCH /v1/responses/:id1,:id2,:id3,...`

A successful request will return the updated responses.

{% code title="Request payload" %}

```json
{
  "responses": [
    {
      "id": "75ad834a-9bd6-4008-b9e6-fc9fa2e7770b",
      "title": "Updated welcome template",
      "body": "<p>Hello {{name}},</p><p>Welcome aboard!</p>"
    }
  ]
}
```

{% endcode %}

**Attributes**

Response `id` is required. See the Create response(s) section for other attributes. When updating a response, you may pass only attributes you want to update. In the example above, only the title and body will be updated.

{% hint style="warning" %}
When the `attachments` array is passed, you must pass all attachments you want to keep. Missing attachments will be removed from the response.
{% endhint %}

{% hint style="info" %}
Responses created by external integrations (such as WhatsApp templates) cannot be updated via this endpoint.
{% endhint %}

### Delete response(s)

`DELETE /v1/responses/:id1,:id2,:id3,...`

Deletes one or more responses.

For organization responses in organizations with restricted response management enabled (enterprise plan feature), only organization admins and owners have permission to delete responses.

{% hint style="info" %}
Responses created by external integrations (such as WhatsApp templates) cannot be deleted via this endpoint.
{% endhint %}

***

## Posts

The posts endpoint lets you inject data in any Missive conversation and manage conversation state. You can create posts in new conversations or append them to existing ones.

Posts are the recommended way to manage conversations (close, move to inbox, assign users, add labels) from integrations and automations. Each post leaves a visible trace in the conversation showing what triggered the action.

Example usage: Each time someone pushes code to Github, create a post that lists the commits. When a support ticket is resolved in your system, create a post that closes the conversation.

A post created from a Github webhook: <https://learn.missiveapp.com/assets/features/007/github-post-dbe8104504c164d552b161ecfcfd39c9a1e100fd84a6fadb9d2eef8e898bdb63.png>

### Managing conversations with posts

Use posts to perform conversation actions while leaving a trace showing what integration triggered the change. Here are common actions:

| To do this                | Use these parameters                            |
| ------------------------- | ----------------------------------------------- |
| Close a conversation      | `close: true`                                   |
| Reopen a conversation     | `reopen: true`                                  |
| Move to inbox (unarchive) | `add_to_inbox: true`                            |
| Move to team inbox        | `add_to_team_inbox: true` and `team: "team-id"` |
| Assign users              | `add_assignees: ["user-id"]`                    |
| Add labels                | `add_shared_labels: ["label-id"]`               |
| Remove labels             | `remove_shared_labels: ["label-id"]`            |
| Set conversation color    | `conversation_color: "#ff0000"`                 |
| Change team               | `team: "team-id"` and `force_team: true`        |

{% hint style="warning" %}
**Archive not available**: There is currently no parameter to archive conversations via the API.
{% endhint %}

**Example: Close a conversation with a custom post**

{% code title="Request" %}

```json
{
  "posts": {
    "conversation": "00f78fe9-f11a-4b4e-a502-67e6138d3b0f",
    "notification": {
      "title": "Ticket resolved",
      "body": "This support ticket was marked as resolved"
    },
    "username": "Support System",
    "text": "Ticket #1234 was resolved and marked as complete.",
    "close": true
  }
}
```

{% endcode %}

This creates a post in the conversation and closes it. Team members will see the post explaining why the conversation was closed.

### Create a post

`POST /v1/posts`

{% code title="Request payload" %}

```json
{
  "posts": {
    "conversation": "00f78fe9-f11a-4b4e-a502-67e6138d3b0f",
    "notification": { "title": "A title", "body": "A body" },
    "username": "Missive",
    "username_icon": "https://s3.amazonaws.com/missive-assets/missive-avatar.png",
    "attachments": [
      {
        "author_name": "Philippe Lehoux",
        "author_link": "mailto:philippe@missiveapp.com",
        "author_icon": "avatar:philippe@missiveapp.com",
        "color": "#2266ED",
        "text": "New customer signed up!",
        "timestamp": 1511540318
      }
    ]
  }
}
```

{% endcode %}

{% code title="Response" %}

```json
{
  "posts": {
    "conversation": "00f78fe9-f11a-4b4e-a502-67e6138d3b0f",
    "id": "ee31f156-db95-4158-923f-b26450e0dbf7"
  }
}
```

{% endcode %}

The response includes:

* `conversation`: ID of the conversation the post was added to
* `id`: ID of the the post (use this ID for deleting the post)

**Attributes**

| Name \* required       | Description                                                            | Example                                                        |
| ---------------------- | ---------------------------------------------------------------------- | -------------------------------------------------------------- |
| `username`             | Name of the post author, used instead of the API token owner’s name    | `"Missive"`                                                    |
| `username_icon`        | Image of the post author, used instead of the API token owner’s avatar | `"https://s3.amazonaws.com/missive-assets/missive-avatar.png"` |
| `conversation_icon`    | Image used as the icon in the conversation list                        | `"https://s3.amazonaws.com/missive-assets/missive-avatar.png"` |
| `conversation_subject` | string                                                                 | `"New user!"`                                                  |
| `conversation_color`   | HEX color code or `"good"` `"warning"` `"danger"` string               | `"#000"`, `"danger"`                                           |
| `text`                 | Main message of a post                                                 | `"This is a post!"`                                            |
| `markdown`             | Main message of a post, formatted with Markdown                        | `"This is a **post**!"`                                        |
| `notification`\*       | Object with the "title" and "body" keys, used to render a notification | `{"title":"A title", "body": "A body"}`                        |
| `attachments`          | Array containing attachment objects, see below for details             | `[{"text": "This is an attachment!"}]`                         |
| `references`           | Array of strings for appending to an existing conversation.            | `["<some-reference-123>"]`                                     |
| `conversation`         | Conversation ID string for appending to an existing conversation       | `"5bb24363-69e5-48ed-80a9-feee988bc953"`                       |
| `organization`         | Organization ID string                                                 | `"90beb742-27a3-44cf-95bc-7e5097167c9d"`                       |
| `team`                 | Team ID string                                                         | `"646bb7f1-2066-40be-b8f6-bacb8b3b7419"`                       |
| `force_team`           | boolean                                                                | `false`                                                        |
| `add_users`            | Array of user ID strings                                               | `["7343bccf-cf35-4b33-99b0-b1d3c69c5f5c"]`                     |
| `add_assignees`        | Array of user ID strings                                               | `["7343bccf-cf35-4b33-99b0-b1d3c69c5f5c"]`                     |
| `add_shared_labels`    | Array of shared label ID strings                                       | `["9825718b-3407-40b8-800d-a27361c86102"]`                     |
| `remove_shared_labels` | Array of shared label ID strings                                       | `["e4aae78f-e932-40a2-9ece-ed764aa85790"]`                     |
| `add_to_inbox`         | boolean                                                                | `false`                                                        |
| `add_to_team_inbox`    | boolean                                                                | `false`                                                        |
| `close`                | boolean                                                                | `false`                                                        |
| `reopen`               | boolean                                                                | `true`                                                         |

Validations

* Either `text`, `markdown` or `attachments` is required.
* All string fields have a variable maximum length, over which the content will be truncated. Those limits are safe enough for normal use.

`references`

The `references` array lets you append a post to an existing conversation. Given a conversation already exists and includes an email with a `Message-ID: <a@a.com>` or `References: <a@a.com>` header, you may add `"references": ["<a@a.com>"]` to your request so the post gets appended to that conversation.

If references passed in the request are related to more than one conversation, the post will only be inserted in the first conversation found. If no reference is provided, the post will be inserted into a new conversation. If one or more references are provided but none of them match an existing conversation, the post will be inserted into a new conversation.

Chevrons around references are optional. Both `["<some-reference-123>"]` and `["some-reference-123"]` would reference the same conversation.

`conversation`

If you know the ID of an existing Missive conversation you want to create your post into, you can pass it as `conversation` instead of using `references`.

`organization`

`organization` lets you scope the search for conversations to the ones already associated with an organization. If a new conversation is created and `organization` is passed, the conversation will be linked to that organization.

`team`

`team` lets you link the post’s conversation to a team. When a conversation is already linked to team, this field is ignored.

`force_team`

`force_team` lets you force a new team even if the conversation is already in another team.

`add_users`

`add_users` determines users who will get access to the conversation. When providing `add_users`, the `organization` field is required.

`add_assignees`

`add_assignees` lets you assign users to the conversation. Existing assignees will remain assigned. When providing `add_assignees`, the `organization` field is required.

`add_shared_labels, remove_shared_labels`

`add_shared_labels` and `remove_shared_labels` let you manage shared labels that are applied to the post’s conversation.

`add_to_team_inbox`

`add_to_team_inbox` moves the conversation to a team inbox for everyone with access. When providing `add_to_team_inbox`, the `team` field is required. A trace of this action will appear in the conversation.

`add_to_inbox`

`add_to_inbox` moves the conversation to Inbox for everyone with access (unarchives the conversation). A trace of this action will appear in the conversation.

`close`

`close` closes the conversation for everyone with access. A trace of this action will appear in the conversation.

`reopen`

`reopen` prevents closed conversations from reopening when creating a post. Set to `true` to keep the conversation closed even after adding the new post.

`attachments`

| Name \* required | Description                                              | Example                                         |
| ---------------- | -------------------------------------------------------- | ----------------------------------------------- |
| `color`          | HEX color code or `"good"` `"warning"` `"danger"` string | `"#ccc"`, `"danger"`                            |
| `pretext`        | Text string                                              | `"This is a pretext!"`                          |
| `author_name`    | Attachment author name                                   | `"User - Phil"`                                 |
| `author_link`    | URL linking to the author                                | `"https://admin.myapp.com/users/phil"`          |
| `author_icon`    | Image URL of the attachment author                       | `"https://myapp.com/phil.png"`                  |
| `title`          | Attachment title                                         | `"This is a title!"`                            |
| `title_link`     | URL linking to the attachment resource                   | `"https://myapp.com/a-resource"`                |
| `image_url`      | Image URL of the attachment                              | `"https://myapp.com/a-resource.png"`            |
| `text`           | Text string                                              | `"This is text!"`                               |
| `markdown`       | Text string, formatted with Markdown                     | `"This is a **bold text**!"`                    |
| `timestamp`      | Integer value in Unix time                               | `1512395766`                                    |
| `footer`         | Text string                                              | `"This is a footer!"`                           |
| `footer_icon`    | Image URL of the attachment footer                       | `"https://myapp.com/logo.png"`                  |
| `fields`         | Array containing of field objects, see below for details | `[{"title": "Paying customer","value": "yes"}]` |

`attachments.fields`

| Name \* required | Description                                                                | Example              |
| ---------------- | -------------------------------------------------------------------------- | -------------------- |
| `title`          | Text string                                                                | `"Paying customer?"` |
| `value`          | Text string                                                                | `"yes"`              |
| `short`          | Boolean. If true, there will be two fields per row, otherwise one per row. | `true`               |

### Delete a post

`DELETE /v1/posts/:id`

Deletes a post from a conversation. The `:id` parameter is the ID of the post (returned in the create post response).

{% hint style="info" %}
For shared conversations, the API token must be generated by an admin in the organization that owns the conversation. Only organization owner and admins have permission to delete posts in conversations shared with their organization.
{% endhint %}

***

## Shared labels

### Create shared labels(s)

`POST /v1/shared_labels`

{% code title="Request payload" %}

```json
{
  "shared_labels": [
    {
      "name": "Heroku",
      "color": "#430098",
      "parent": "b45a00fd-353s-89l2-a487-2465c35c3r91",
      "organization": "0d9bab85-a74f-4ece-9142-0f9b9f36ff92"
    }
  ]
}
```

{% endcode %}

A successful request will return newly created shared labels.

{% code title="Response" %}

```json
{
  "shared_labels": [
    {
      "id": "6960dfv2-4382-4230-aa70-933a1c62040b",
      "name": "Heroku",
      "name_with_parent_names": "Invoices/Heroku",
      "color": "#430098",
      "parent": "b45a00fd-353s-89l2-a487-2465c35c3r91",
      "organization": "0d9bab85-a74f-4ece-9142-0f9b9f36ff92"
    }
  ]
}
```

{% endcode %}

**Attributes**

| Name \* required          | Description                                     | Example                                   |
| ------------------------- | ----------------------------------------------- | ----------------------------------------- |
| `name`\*                  | Label name string                               | `"Heroku"`                                |
| `organization`\*          | Organization ID string                          | `"0d9bab85-a74f-4ece-9142-0f9b9f36ff92"`  |
| `color`                   | HEX color code                                  | `"#430098"`                               |
| `parent`                  | Parent shared label ID string                   | `"9b45a00fd-353s-89l2-a487-2465c35c3r91"` |
| `share_with_organization` | Boolean                                         | `true`                                    |
| `share_with_team`         | Team ID string                                  | `nil`                                     |
| `share_with_users`        | Array of user ID strings                        | `[]`                                      |
| `visibility`              | Either `'organization'` or `'delegates'` string | `'organization'`                          |

`share_with_organization`, `share_with_team`, `share_with_users`\
Users affected by either of those params will have access to all the conversations in the label.

`visibility`

The visibility param controls whom the label is visible to. If the value is `organization`, everyone in the organization can use the label. If the value is `delegates`, only admins and auto-shared users (users affected by `share_with_users`, `share_with_organization`, `share_with_team`) can use the label.

### Update shared label(s)

`PATCH /v1/shared_labels/:id1,:id2,:id3,...`

A successful request will return the updated shared labels.

{% code title="Request payload" %}

```json
{
  "shared_labels": [
    {
      "id": "ee31f156-db95-4158-923f-b26450e0dbf7",
      "name": "Updated Label",
      "color": "#f96885"
    }
  ]
}
```

{% endcode %}

Attributes

Shared label `id` is required. See the Create shared label(s) section for other attributes. You may pass only attributes you want to update. In the example above, the name and color will be updated.

Basic users can update:

* `name`: The name of the label
* `color`: The color of the label as a hex color code (e.g. #f96885)
* `parent`: The ID of the parent label

Admin/owner users can additionally update:

* `visibility`: Must be either 'delegates' or 'organization'
* `share_with_organization`: Whether to share the label with the entire organization
* `share_with_team`: The ID of the team to share the label with
* `share_with_users`: An array of user IDs to share the label with

### List shared labels

`GET /v1/shared_labels`

List shared labels in organizations the authenticated user is part of and has access to.

{% code title="Response" %}

```json
{
  "shared_labels": [
    {
      "id": "b45a00fd-353s-89l2-a487-2465c35c3r91",
      "color": null,
      "name": "Invoices",
      "name_with_parent_names": "Invoices",
      "organization": "0d9bab85-a74f-4ece-9142-0f9b9f36ff92"
    }
  ]
}
```

{% endcode %}

**Params**

| Name \* required | Default | Description                                        |
| ---------------- | ------- | -------------------------------------------------- |
| `organization`   | `null`  | Organization ID                                    |
| `limit`          | `50`    | Number of shared labels returned. Max value: `200` |
| `offset`         | `0`     | Offset used to paginate.                           |

***

## Teams

### List teams

`GET /v1/teams`

List teams in organizations the authenticated user is part of and has access to.

{% code title="Response" %}

```json
{
  "teams": [
    {
      "id": "d75aecb6-96a2-4b5f-afa6-19d1916052ea",
      "name": "Sales",
      "organization": "0d9bab85-a74f-4ece-9142-0f9b9f36ff92",
      "active_members": ["a41a00fd-453d-49d7-a487-9765c35a3b70"],
      "observers": []
    }
  ]
}
```

{% endcode %}

**Params**

| Name \* required | Default | Description                                |
| ---------------- | ------- | ------------------------------------------ |
| `organization`   | `null`  | Organization ID                            |
| `limit`          | `50`    | Number of teams returned. Max value: `200` |
| `offset`         | `0`     | Offset used to paginate.                   |

### Create team(s)

`POST /v1/teams`

Create a new team in an organization. The API token must belong to an admin or owner of the organization.

{% tabs %}
{% tab title="Basic" %}
{% code title="Request payload" %}

```json
{
  "teams": [
    {
      "name": "Support",
      "organization": "0d9bab85-a74f-4ece-9142-0f9b9f36ff92",
      "active_members": ["1ce8117e-ae42-4304-b953-c81656da4bd1"]
    }
  ]
}
```

{% endcode %}
{% endtab %}

{% tab title="Full example" %}
{% code title="Request payload" %}

```json
{
  "teams": [
    {
      "name": "Support",
      "organization": "0d9bab85-a74f-4ece-9142-0f9b9f36ff92",
      "emoji": ":dart:",
      "color": "#2266ED",
      "active_members": [
        "1ce8117e-ae42-4304-b953-c81656da4bd1",
        "74f91030-39b8-4627-9835-9cfbce9d67c1"
      ],
      "observers": ["a41a00fd-453d-49d7-a487-9765c35a3b70"],
      "business_hours": {
        "tz": "America/Montreal",
        "t": [
          { "d": 1, "s": [32400, 61200] },
          { "d": 2, "s": [32400, 61200] },
          { "d": 3, "s": [32400, 61200] },
          { "d": 4, "s": [32400, 61200] },
          { "d": 5, "s": [32400, 61200] }
        ]
      },
      "inactivity_period": 604800,
      "team_mention_behavior": "only_active_members",
      "user_reply_behavior": "assign_user",
      "received_reply_behavior": "show_in_assignee_inbox",
      "team_sidebar_behavior": "show_team_space",
      "team_inbox_enabled": true,
      "chat_room_enabled": true
    }
  ]
}
```

{% endcode %}
{% endtab %}
{% endtabs %}

{% code title="Response" %}

```json
{
  "teams": [
    {
      "id": "d75aecb6-96a2-4b5f-afa6-19d1916052ea",
      "name": "Support",
      "emoji": ":dart:",
      "color": "#2266ED",
      "organization": "0d9bab85-a74f-4ece-9142-0f9b9f36ff92",
      "active_members": [
        "1ce8117e-ae42-4304-b953-c81656da4bd1",
        "74f91030-39b8-4627-9835-9cfbce9d67c1"
      ],
      "observers": ["a41a00fd-453d-49d7-a487-9765c35a3b70"],
      "business_hours": {
        "tz": "America/Montreal",
        "t": [
          { "d": 1, "s": [32400, 61200] },
          { "d": 2, "s": [32400, 61200] },
          { "d": 3, "s": [32400, 61200] },
          { "d": 4, "s": [32400, 61200] },
          { "d": 5, "s": [32400, 61200] }
        ]
      },
      "inactivity_period": 604800,
      "team_mention_behavior": "only_active_members",
      "user_reply_behavior": "assign_user",
      "received_reply_behavior": "show_in_assignee_inbox",
      "team_sidebar_behavior": "show_team_space",
      "team_inbox_enabled": true,
      "chat_room_enabled": true
    }
  ]
}
```

{% endcode %}

**Attributes**

| Name \* required          | Description                                                                                   | Example                                    |
| ------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `name`\*                  | Team name string                                                                              | `"Support"`                                |
| `organization`\*          | Organization ID string                                                                        | `"0d9bab85-a74f-4ece-9142-0f9b9f36ff92"`   |
| `emoji`                   | Emoji shortcode in `:name:` format (see [Emojipedia](https://emojipedia.org/) for shortcodes) | `":dart:"`                                 |
| `color`                   | [HEX color code](https://en.wikipedia.org/wiki/Web_colors#Hex_triplet)                        | `"#2266ED"`                                |
| `active_members`          | Array of user ID strings for active team members                                              | `["1ce8117e-ae42-4304-b953-c81656da4bd1"]` |
| `observers`               | Array of user ID strings for team observers                                                   | `["a41a00fd-453d-49d7-a487-9765c35a3b70"]` |
| `business_hours`          | Business hours configuration object, see below for details                                    | `{"tz": "America/Montreal", "t": [...]}`   |
| `inactivity_period`       | Inactivity period in seconds before a conversation is considered stale                        | `604800`                                   |
| `team_mention_behavior`   | Who receives notifications when team is mentioned                                             | `"only_active_members"`                    |
| `user_reply_behavior`     | What happens when a user replies to an unassigned conversation                                | `"assign_user"`                            |
| `received_reply_behavior` | Where to show assigned conversations when a new reply is received                             | `"show_in_assignee_inbox"`                 |
| `team_sidebar_behavior`   | What to show in the sidebar for this team                                                     | `"show_team_space"`                        |
| `team_inbox_enabled`      | Whether the team inbox is enabled                                                             | `true`                                     |
| `chat_room_enabled`       | Whether the team chat room is enabled                                                         | `true`                                     |

`active_members, observers`

Active members get notified for new messages in the team inbox and also see conversations in the unified Team Inboxes view. Observers do not get notified for new messages in the team inbox and do not see conversations in the unified Team Inboxes view, but they can open and manage the team inbox as needed. Both get access to contacts, responses, calendars and integrations shared with the team.

`business_hours`

The `business_hours` object defines when the team is available:

* `tz`: Time zone identifier (see [list of time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones#List))
* `t`: Array of time slot objects, each containing:
  * `d`: Day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
  * `s`: Array of two integers representing start and end times in seconds from midnight (e.g., `[32400, 61200]` = 9:00 AM to 5:00 PM)

`inactivity_period`

The number of seconds of inactivity after which a conversation is considered stale. Common values: `86400` (1 day), `259200` (3 days), `604800` (1 week).

`team_mention_behavior`

* `all_members`: All team members (active and observers) receive notifications when the team is mentioned
* `only_active_members`: Only active members receive notifications when the team is mentioned

`user_reply_behavior`

* `assign_user`: Automatically assign the user to the conversation when they reply
* `leave_in_team_inbox`: Leave the conversation in the team inbox without assigning

`received_reply_behavior`

* `show_in_assignee_inbox`: Show in the assignee's inbox when a new reply is received
* `show_in_team_inbox`: Move back to team inbox when a new reply is received

`team_sidebar_behavior`

* `show_team_space`: Show the full team space in the sidebar
* `show_team_inbox`: Show only the team inbox in the sidebar

### Update team(s)

`PATCH /v1/teams/:id1,:id2,:id3,...`

Update one or more teams. The API token must belong to an admin or owner of the organization.

A successful request will return the updated teams.

{% code title="Request payload" %}

```json
{
  "teams": [
    {
      "id": "d75aecb6-96a2-4b5f-afa6-19d1916052ea",
      "name": "Customer Support",
      "emoji": ":zap:",
      "active_members": [
        "1ce8117e-ae42-4304-b953-c81656da4bd1",
        "74f91030-39b8-4627-9835-9cfbce9d67c1"
      ]
    }
  ]
}
```

{% endcode %}

**Attributes**

Team `id` is required. See the Create team(s) section for other attributes. You may pass only attributes you want to update. In the example above, only the name, emoji, and active members will be updated.

***

## Users

### List users

`GET /v1/users`

List users in organizations the authenticated user is part of.

{% code title="Response" %}

```json
{
  "users": [
    {
      "id": "a41a00fd-453d-49d7-a487-9765c35a3b70",
      "me": true,
      "email": "philippe@missiveapp.com",
      "name": "Philippe Lehoux",
      "avatar_url": "https://..."
    }
  ]
}
```

{% endcode %}

**Params**

| Name \* required | Default | Description                                |
| ---------------- | ------- | ------------------------------------------ |
| `organization`   | `null`  | Organization ID                            |
| `limit`          | `50`    | Number of users returned. Max value: `200` |
| `offset`         | `0`     | Offset used to paginate.                   |

***

## Tasks

Task endpoints let you create and manage tasks programmatically.

Example usage Automatically create tasks from your project management tool or bug tracker.

### List tasks

`GET /v1/tasks`

List tasks the authenticated user has access to. Results are ordered by last activity time (most recent first) and can be filtered by various criteria.

Request example:

```
GET /v1/tasks?organization=0d9bab85-a74f-4ece-9142-0f9b9f36ff92&state=todo&limit=10
```

{% code title="Response" %}

```json
{
  "tasks": [
    {
      "id": "75ad834a-9bd6-4008-b9e6-fc9fa2e7770b",
      "conversation": null,
      "title": "Review pull request",
      "description": "Please review PR #123",
      "state": "todo",
      "started_at": null,
      "closed_at": null,
      "assignees": ["1ce8117e-ae42-4304-b953-c81656da4bd1"],
      "team": "0e24f298-965d-4475-9220-b32636a1e2c3",
      "due_at": 1692371867,
      "type": "task",
      "last_activity_at": 1692371900
    },
    {
      "id": "a5d2aa1c-3828-4f90-bbd8-3dffaadda97e",
      "conversation": null,
      "title": "Follow up with client",
      "description": null,
      "state": "in_progress",
      "started_at": 1692371000,
      "closed_at": null,
      "assignees": ["74f91030-39b8-4627-9835-9cfbce9d67c1"],
      "team": null,
      "due_at": null,
      "type": "conversation",
      "last_activity_at": 1692371800
    }
  ]
}
```

{% endcode %}

**Query parameters**

| Name           | Description                                                                            | Example                                  |
| -------------- | -------------------------------------------------------------------------------------- | ---------------------------------------- |
| `limit`        | Number of tasks to return (min 2, max 50)                                              | `10`                                     |
| `until`        | Unix timestamp for pagination, returns tasks with last\_activity\_at before this value | `1692371867`                             |
| `organization` | Filter by organization ID                                                              | `"0d9bab85-a74f-4ece-9142-0f9b9f36ff92"` |
| `team`         | Filter by team ID                                                                      | `"0e24f298-965d-4475-9220-b32636a1e2c3"` |
| `assignee`     | Filter by assignee user ID                                                             | `"1ce8117e-ae42-4304-b953-c81656da4bd1"` |
| `state`        | Filter by state. One of: `todo`, `in_progress`, `closed`                               | `"todo"`                                 |
| `type`         | Filter by type. One of: `task`, `conversation`, `all`                                  | `"all"`                                  |
| `conversation` | Filter by parent conversation ID (returns subtasks of that conversation)               | `"a5d2aa1c-3828-4f90-bbd8-3dffaadda97e"` |
| `due_at_gteq`  | Filter tasks with `due_at` greater than or equal to this Unix timestamp                | `1692371867`                             |
| `due_at_lteq`  | Filter tasks with `due_at` less than or equal to this Unix timestamp                   | `1692400000`                             |

`type`

Filter tasks by their type:

* `task` - Only return tasks (conversation subtasks or standalone tasks)
* `conversation` - Only return tasked conversations (assigned or due conversations)
* `all` - Return both tasks and tasked conversations (default)

Pagination

To paginate through results, use the `last_activity_at` value from the last task in the response as the `until` parameter for the next request. Subtract 1 from the timestamp to avoid duplicates since `until` is inclusive.

### Get a task

`GET /v1/tasks/:id`

Get a single task by ID. Returns the task with full details including assignees and team information.

{% code title="Response" %}

```json
{
  "tasks": {
    "id": "75ad834a-9bd6-4008-b9e6-fc9fa2e7770b",
    "conversation": null,
    "title": "Review pull request",
    "description": "Please review PR #123",
    "state": "todo",
    "started_at": null,
    "closed_at": null,
    "assignees": [
      {
        "id": "1ce8117e-ae42-4304-b953-c81656da4bd1",
        "name": "John Doe",
        "email": "john@example.com",
        "avatar_url": "https://..."
      }
    ],
    "team": {
      "id": "0e24f298-965d-4475-9220-b32636a1e2c3",
      "name": "Engineering",
      "organization": "0d9bab85-a74f-4ece-9142-0f9b9f36ff92"
    },
    "due_at": 1692371867,
    "type": "task"
  }
}
```

{% endcode %}

The `assignees` array contains full user objects with `id`, `name`, `email`, and `avatar_url`. The `team` object contains full team information with `id`, `name`, and `organization`.

### Create a task

`POST /v1/tasks`

Create a new task. Tasks can be standalone, conversations or created inside conversations.

{% tabs %}
{% tab title="Standalone task" %}
{% code title="Request payload" %}

```json
{
  "tasks": {
    "organization": "0d9bab85-a74f-4ece-9142-0f9b9f36ff92",
    "title": "Review pull request",
    "description": "Please review PR #123",
    "team": "0e24f298-965d-4475-9220-b32636a1e2c3",
    "due_at": 1692371867
  }
}
```

{% endcode %}
{% endtab %}

{% tab title="Subtask" %}
{% code title="Request payload" %}

```json
{
  "tasks": {
    "organization": "0d9bab85-a74f-4ece-9142-0f9b9f36ff92",
    "title": "Follow up with client",
    "description": "Discuss proposal details",
    "assignees": ["1ce8117e-ae42-4304-b953-c81656da4bd1"],
    "conversation": "a5d2aa1c-3828-4f90-bbd8-3dffaadda97e",
    "subtask": true,
    "add_users": ["74f91030-39b8-4627-9835-9cfbce9d67c1"]
  }
}
```

{% endcode %}
{% endtab %}
{% endtabs %}

{% code title="Response" %}

```json
{
  "tasks": {
    "id": "75ad834a-9bd6-4008-b9e6-fc9fa2e7770b",
    "conversation": null,
    "title": "Updated task title",
    "description": "New description",
    "state": "in_progress",
    "assignees": ["1ce8117e-ae42-4304-b953-c81656da4bd1"],
    "team": "0e24f298-965d-4475-9220-b32636a1e2c3",
    "due_at": 1692371867
  }
}
```

{% endcode %}

**Params**

| Name \* required       | Description                                                                                 | Example                                    |
| ---------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------ |
| `title`\*              | Task title (max 1000 characters)                                                            | `"Review pull request"`                    |
| `description`          | Task description (max 10000 characters)                                                     | `"Please review PR #123"`                  |
| `state`                | Task state. One of: `todo`, `in_progress`, `closed`                                         | `"in_progress"`                            |
| `organization`         | Organization ID string (required when using team, assignees, or add\_users)                 | `"0d9bab85-a74f-4ece-9142-0f9b9f36ff92"`   |
| `team`                 | Team ID string (either team or assignees is required for standalone tasks)                  | `"0e24f298-965d-4475-9220-b32636a1e2c3"`   |
| `assignees`            | Array of user ID strings (either team or assignees is required for standalone tasks)        | `["1ce8117e-ae42-4304-b953-c81656da4bd1"]` |
| `due_at`               | Unix timestamp for task due date                                                            | `1692371867`                               |
| `subtask`              | Boolean indicating if this is a subtask of a conversation                                   | `true`                                     |
| `conversation`         | Parent conversation ID string (required when subtask is true)                               | `"a5d2aa1c-3828-4f90-bbd8-3dffaadda97e"`   |
| `references`           | Array of strings for finding or creating parent conversation (used when creating a subtask) | `["<some-reference-123>"]`                 |
| `conversation_subject` | Subject for the parent conversation when creating via references                            | `"New feature request"`                    |
| `add_users`            | Array of user IDs to add to parent conversation (only for subtasks)                         | `["74f91030-39b8-4627-9835-9cfbce9d67c1"]` |

### Update a task

`PATCH /v1/tasks/:id`

Update an existing task's attributes.

{% code title="Request payload" %}

```json
{
  "tasks": {
    "title": "Updated task title",
    "description": "New description",
    "state": "in_progress",
    "assignees": ["1ce8117e-ae42-4304-b953-c81656da4bd1"],
    "team": "0e24f298-965d-4475-9220-b32636a1e2c3",
    "due_at": 1692371867
  }
}
```

{% endcode %}

**Params**

| Name          | Description                                         | Example                                    |
| ------------- | --------------------------------------------------- | ------------------------------------------ |
| `title`       | Task title (max 1000 characters)                    | `"Updated task title"`                     |
| `description` | Task description (max 10000 characters)             | `"New description"`                        |
| `state`       | Task state. One of: `todo`, `in_progress`, `closed` | `"in_progress"`                            |
| `assignees`   | Array of user ID strings                            | `["1ce8117e-ae42-4304-b953-c81656da4bd1"]` |
| `team`        | Team ID string                                      | `"0e24f298-965d-4475-9220-b32636a1e2c3"`   |
| `due_at`      | Unix timestamp for task due date                    | `1692371867`                               |

`title`

The title of the task that will be displayed in the task list and task details. Limited to 1000 characters.

`description`

A longer description of the task that provides additional context or details. The description supports plain text and is limited to 10000 characters.

`state`

The current state of the task. Can be one of:

* `todo` - Task is pending and needs to be worked on
* `in_progress` - Task is currently being worked on
* `closed` - Task has been completed or closed

If not specified, new tasks default to `todo` state.

`organization`

The organization ID is required when assigning tasks to teams or users via `team`, `assignees`, or `add_users` parameters. This ensures the task is created in the correct organizational context.

`team`

For standalone tasks (not subtasks), either `team` or `assignees` must be specified. When a team is assigned, all team members will have access to the task and it will appear in the team's task list.

`assignees`

For standalone tasks (not subtasks), either `team` or `assignees` must be specified. When users are assigned, they will be responsible for completing the task and it will appear in their personal task lists.

`due_at`

Sets a due date for the task using a Unix timestamp. The task will be marked as overdue if not completed by this date. Setting this field is optional.

`subtask`

When `true`, indicates that this task should be created as a subtask within a conversation. Subtasks require either a `conversation` ID or `references` to identify the parent conversation.

`conversation`

Required when creating a subtask (`subtask: true`). Specifies the ID of the existing conversation where the subtask should be created.

`references`

An alternative to `conversation` when creating subtasks. Allows you to find or create the parent conversation using message references (like email Message-IDs). If multiple conversations match the references, the task will be created in the first matching conversation.

`conversation_subject`

When creating a subtask using `references` and a new conversation needs to be created, this field sets the subject of that new conversation.

`add_users`

When creating subtasks, this parameter allows you to add additional users to the parent conversation. These users will have access to both the conversation and the subtask. The `organization` parameter is required when using `add_users`.

***

## Hooks

Example usage Automatically trigger workflows in external systems when new messages arrive or comments are added.

### Create webhook

`POST /v1/hooks`

Create a webhook subscription to receive notifications for specific events in Missive. This endpoint allows integration with services like Zapier, Relay, n8n, and others, or can be used directly for custom integrations. Under the hood, this endpoint creates a Missive rule with a webhook action - you can later view and edit these rules in your Missive Rules settings, just like any other rule you create manually.

{% code title="Request payload" %}

```json
{
  "hooks": {
    "type": "new_comment",
    "url": "https://hooks.example.com/callback",
    "organization": "0d9bab85-a74f-4ece-9142-0f9b9f36ff92",
    "is_task": true,
    "author": "user_id",
    "mention": "mentioned_user_id",
    "content_contains": "search text",
    "content_starts_with": "prefix",
    "content_ends_with": "suffix"
  }
}
```

{% endcode %}

{% code title="Response" %}

```json
{
  "hooks": {
    "id": "d75aecb6-96a2-4b5f-afa6-19d1916052ea"
  }
}
```

{% endcode %}

**Params**

| Name \* required               | Default | Description                                                                                                                                                                                    |
| ------------------------------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `type` \*                      |         | Event type to subscribe to. Supported values: incoming\_email, incoming\_sms\_message, incoming\_facebook\_message, incoming\_whatsapp\_message, incoming\_twilio\_chat\_message, new\_comment |
| `url` \*                       |         | The webhook URL that will receive the event notifications                                                                                                                                      |
| `organization`                 | `null`  | Organization ID. If not provided, creates a personal webhook subscription                                                                                                                      |
| `content_contains`             | `null`  | Only trigger when content contains this text                                                                                                                                                   |
| `content_starts_with`          | `null`  | Only trigger when content starts with this text                                                                                                                                                |
| `content_ends_with`            | `null`  | Only trigger when content ends with this text                                                                                                                                                  |
| Exclusive to `new_comment`:    |         |                                                                                                                                                                                                |
| `is_task`                      | `false` | Only trigger for task comments                                                                                                                                                                 |
| `author`                       | `null`  | Only trigger for comments by this user ID                                                                                                                                                      |
| `mention`                      | `null`  | Only trigger when this user ID is mentioned                                                                                                                                                    |
| Exclusive to `incoming_email`: |         |                                                                                                                                                                                                |
| `from_eq`                      | `null`  | Only trigger for messages from this exact email address                                                                                                                                        |
| `subject_contains`             | `null`  | Only trigger for messages with this text in the subject                                                                                                                                        |

### Delete webhook

`DELETE /v1/hooks/:id`

Delete a webhook subscription. Behind the scene it deletes the rule containing the webhook action.

Last updated on September 18th, 2025

***

Need more specific answers?\\
