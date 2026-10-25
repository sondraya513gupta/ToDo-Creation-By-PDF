import asyncio
from app.services.todo_service import TodoService
from app.models.todo import TodoCreate, TodoUpdate, TodoPriority

async def run_tests():
    print("--- 1. Testing TodoService Initial State ---")
    service = TodoService()
    initial_todos = service.get_all()
    print(f"Total initial todos: {initial_todos.total}, Completed: {initial_todos.completed}, Pending: {initial_todos.pending}")
    assert initial_todos.total >= 3, "Expected at least 3 seeded todos"

    print("\n--- 2. Testing Creating a Todo ---")
    created = service.create(
        TodoCreate(
            title="Mobile App Integration Test",
            description="Testing React Native connection to FastAPI",
            priority=TodoPriority.HIGH,
            category="Testing",
        )
    )
    print(f"Created task: {created.id} - '{created.title}' (Priority: {created.priority.value})")

    print("\n--- 3. Testing Updating a Todo ---")
    updated = service.update(created.id, TodoUpdate(completed=True))
    assert updated.completed is True, "Expected todo to be completed"
    print(f"Updated status: completed = {updated.completed}")

    print("\n--- 4. Testing AI Task Generation ---")
    ai_items = await service.generate_todos_from_prompt("Build an AI powered mobile app in React Native")
    print(f"Generated {len(ai_items)} AI tasks! First task: '{ai_items[0].title}'")

    print("\n--- 5. Testing Delete Todo ---")
    deleted = service.delete(created.id)
    assert deleted is True, "Expected todo to be deleted"
    print(f"Deleted task {created.id}: {deleted}")

    print("\n=============================================")
    print("[SUCCESS] ALL TODOSERVICE FEATURES PASSED PERFECTLY!")
    print("=============================================")

if __name__ == "__main__":
    asyncio.run(run_tests())

