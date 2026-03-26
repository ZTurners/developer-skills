---
name: memory-policy

description: An instruction for defining memory policies for an agent. This skill outlines the types of memory that the agent can access and how it should use that memory when processing user requests.
---

# Memory Policy
This section outlines the memory policies for this skill. It specifies what types of memory the skill can access and how it should use that memory when processing user requests.

## Memory Types
- **User Memory**: This includes any information that the user has explicitly provided during the current session. This can include user preferences, previous interactions, and any context that the user has shared. The folder is `/memories/user/`.
- **Session Memory**: This includes any information that has been stored during the current session. This can include temporary data that is relevant to the current interaction but may not be relevant in future sessions. The folder is `/memories/session/`.
- **Repo Memory**: This includes any information that has been stored in the repository. This can include code snippets, documentation, and any other relevant information that has been stored in the repository. The folder is `/memories/repo/`.

## Memory Policies Specification
This section specifies the policies for how this skill should use memory. It includes guidelines for accessing, storing, and managing different types of memory.
The user I will specify how to use memories in the following way:
[Memory Type] [Access Policy, Storage Policy]

For example:
- User Memory [Read, Store]: This means that the skill can read from and store information in the user memory.
- Session Memory [NoAccess, NoStore]: This means that the skill cannot access or store any information in the session memory.
- Repo Memory [Read, NoStore]: This means that the skill can read from the repo memory but cannot store any information in it.