## SETUP
- This is a simple Node.js application that uses Node.js for the backend and PostgreSQL for the database. To install all required dependencies, run:

```sh
npm install
```
- Ensure to create your pg database, and create a .env file, so you put in the DB_NAME, DB_HOST, DB_USERNAME AND DB_PASSWORD.

- Run the schema builder
```sh
npm run db:create
```

### Docker
    ```sh
    docker compose up
    ```

## Database Schema

### Regions Schema
- `id`: integer, primary key
- `name`: string
- `created_at`: string

### Questions Schema
- `id`: integer
- `question`: string
- `current_region_id` (indexed): integer
- `is_assigned`: boolean

### Cycle Schema
- `id`: integer
- `cycle_duration` (in days): integer
- `count` (in days): integer

Note: There is also a `user_schema`, but it is not included here as it does not directly affect our implementation.

## Overview

### Explanation (Round Robin)
The goal is for all users to receive the same question in a cycle. We do not need to pre-compute a set of questions for each region at the start of the cycle. Instead, we can map the `region_id` to the `questions_table` and shift the `current_region_id` in the `questions_table` at the end of each cycle.

The `questions_table` has a `current_region_id` column that maps to the primary key of the `regions` schema. The idea is to keep the questions static and shift the `current_region_id` when a cycle is complete. For example, if `Questions(current_region_id) = [1, 2, 3, 4, ..., M]`, after a shift, it would become `[M, 1, 2, 3, 4, ..., M-1]`. This means the regions or users do not need to worry about changes. A user is mapped to a region, which then checks the index of the `current_region_id` in the table for its question. This is similar to the concept of Round Robin. Each cycle, it simply goes around.

The implementation can be found in the `QuestionService`:

```typescript
src/service/questions.ts
new QuestionService().roundRobin()
```

### Pros
- The database handles the update by incrementing, which is more optimal as it scales compared to using a data structure like a list to map regions to their questions.
- This single update only affects the `questions_table`, separating the concerns of users and regions and abstracting any implementation details from affecting the questions they receive.
- It adapts to any scaling mechanism required, as the number of users does not directly impact the mapping/implementation.
- Easy to implement with no complexity once understood.

### Cons
- If the cycle runs more frequently than daily, the `questions_table` may experience multiple updates and reads. Pre-computation would be more optimal in this case.
- It could be overkill if the number of regions and questions is relatively small and could be easily handled with a simple loop.

### Improvement
We can use a count on the `Cycle` schema, which acts as a shift count. The duration of each cycle is started and a shift count is multiplied by the count. This also implements the shift but only updates one row at a time, which is quicker and faster than incrementing every row by 1.

For example, for `region(id = 1, name = "Singapore")`, `shift_count = 1`. The `questions_table` will be queried for `region_id = (region:id(1) + shift_count(1)) = 1`. In the next cycle, `shift_count` will be incremented to 2. The `questions_table` for Singapore will be `region:id(1) + shift_count(2) = 2`. Once a cycle reaches `N`, it either resets to 1 or takes the modulus of `N(+1)` when using the shift count.

### Pros
- Inherits all the pros mentioned above and is better than pre-computing even for short cycles.

### Cons
- The `cycle` table becomes the single source of truth for the counts.

## Running The Program
To build and run the program, creating a scheduler (default to 7 PM SGT Mondays), run:

```sh
npm run start
```

**Note:** The focus is on functionality, and the code could be optimized with tests.
