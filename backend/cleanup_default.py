"""One-off cleanup: remove default certificates, SPM (programs/indicators/reports),
and sample policy briefs while KEEPING all users intact."""
import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).parent / ".env")


async def main():
    client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    db = client[os.environ["DB_NAME"]]

    # Count users before (must stay unchanged)
    users_before = await db.users.count_documents({})

    targets = ["certificates", "programs", "indicators", "indicator_reports", "policy_briefs"]
    results = {}
    for col in targets:
        res = await db[col].delete_many({})
        results[col] = res.deleted_count

    users_after = await db.users.count_documents({})

    print("Deleted counts:", results)
    print(f"Users before={users_before} after={users_after} (preserved)")
    client.close()


if __name__ == "__main__":
    asyncio.run(main())
