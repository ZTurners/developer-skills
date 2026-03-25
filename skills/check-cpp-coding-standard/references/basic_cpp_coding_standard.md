---
description: "Use for C++ files in source/. Defines Basic C++ coding standards for naming, formatting, ownership, interfaces, and module lifecycle patterns."
applyTo: "source/**/*.{h,hpp,hxx,c,cc,cpp,cxx,inl}"
---
# C++ Basic Coding Standard

## 0. Principles

- **Use 4 spaces per indentation level. Never use tabs.** Tabs are disallowed in all contexts: code, preprocessor directives, and documentation.
- Use LF line endings.
- Use brace-on-next-line style for all blocks: namespaces, classes, functions, constructors, destructors, `if`, `for`, `while`, `switch`, and lambdas.
- Opening braces must start on a new line. `XXXX{` and `XXXX {` are both forbidden; always write `XXXX` and then `{` on the next line.
- Use inner block scopes inside functions to limit the lifetime of temporary local variables. If a temporary object, handle, lock, buffer, or helper is needed for only one phase of a function, put it in its own `{ ... }` block.
- If logic is used only once inside one function, prefer an inner RAII-scoped block over extracting a new helper function. Treat the inner block as the local anonymous phase for that function.
- Keep one logical statement per line.
- Avoid trailing whitespace.
- Always use explicit comparisons; never rely on implicit boolean conversion.
  - For booleans: `if (value != true)` or `if (value == true)`, not `if (!value)` or `if (value)`.
  - For pointers: `if (ptr != nullptr)` or `if (ptr == nullptr)`, not `if (ptr)` or `if (!ptr)`.
- Emphasize semantic clarity first: definitions are `PascalCase`, function names are verb-first `lowerCamelCase`, and instance-like values are `snake_case`.

## 1. Naming

### 1.1 File Naming Standard

- Use `snake_case` for file names.
- Name files by responsibility, not by type suffixes like `utils` or `helpers`.
- Keep header/source pairs aligned by base name where applicable:
  - `swapchain_manager.h` / `swapchain_manager.cpp`
  - `window_settings.h` / `window_settings.cpp`
- Keep platform-specific files explicit:
  - `window_factory.windows.cpp`
  - `window_factory.linux.cpp`
  - `window_factory.android.cpp`
- For module entry points, use clear role-oriented names such as `module_entry.cpp`.

### 1.2 Code Naming Standard

Emphasize semantic clarity first: definitions are `PascalCase`, function names are verb-first `lowerCamelCase`, and instance-like values are `snake_case`.

- Definitions (`namespace`, `class`, `struct`, `enum`, `using`) use `PascalCase`.
- Interface types use `I` prefix with `PascalCase` (`IWindow`, `IRenderDevice`).
- Functions and methods use `lowerCamelCase`.
- Function names must start with a lowercase verb (`createWindow`, `initializeDevice`, `loadScene`).
- Boolean functions should read like predicates (`isVisible`, `hasDevice`, `canResize`).
- Local variables and parameters use `snake_case`.
- Const values use `k_` prefix with `snake_case` (`k_max_frames_in_flight`, `k_enable_validation`).
- Member fields use `m_` prefix with `snake_case` (`m_window_width`, `m_render_device`).
- Static data members use `s_` prefix with `snake_case` (`s_instance_count`).
- Enum types use `PascalCase`; enum values use `PascalCase`.
- Macro names use `UPPER_SNAKE_CASE`.

**Example:**

```cpp
namespace Arieo::Cache // Namespace definition: PascalCase segment
{
    class IDataStore // Interface definition: I + PascalCase
    {
    public:
        virtual ~IDataStore() = default;
        virtual bool initializeStore() = 0; // Function: lowerCamelCase, starts with verb
    };

    enum class StorageType // Enum definition: PascalCase
    {
        MemoryBased, // Enum value: PascalCase
        FileSystemBased
    };

    class MemoryDataStore final : public IDataStore // Class definition: PascalCase
    {
    public:
        bool initializeStore() override; // Function: starts with verb "initialize"
        bool isReady() const; // Boolean predicate: isXxx

    private:
        static constexpr uint32_t k_max_cache_entries = 1000; // Const value: k_ + snake_case
        static inline uint32_t s_total_stores_created = 0; // Static member: s_ + snake_case

        uint32_t m_entry_count = 0; // Member: m_ + snake_case
        bool m_is_ready = false; // Member: m_ + snake_case
    };

    inline bool MemoryDataStore::initializeStore()
    {
        const bool k_validate_entries = true; // Local const: k_ + snake_case
        const uint32_t max_entries = k_max_cache_entries; // Local variable: snake_case

        if (k_validate_entries != true)
        {
            return false;
        }

        m_entry_count = 0;
        m_is_ready = true;
        return true;
    }
}

#define ARIEO_CACHE_STATISTICS_ENABLED 1 // Macro: UPPER_SNAKE_CASE
```

## 2. Interface Definitions

### 2.1 Interface Class Conventions

- Interface classes always use the `I` prefix followed by `PascalCase` (e.g., `IWindow`, `IRenderDevice`).
- Interface classes are **always abstract** with **pure virtual methods**; use `= 0`.
- Do not declare interface constructors or destructors in interface definitions. Interface declarations should contain only pure virtual methods.

Example:

```cpp
class IWindow
{
public:
    virtual bool initialize() = 0;
    virtual void destroy() = 0;
    virtual std::uint64_t getWindowHandle() const = 0;
};
```
- Declare interfaces in `source/02_engine/interfaces/Arieo-Interface-*/public/include/interface/*/` folders.
- Each interface represents a contract that implementations must fulfill; keep interfaces minimal and focused.

### 2.2 DLL Boundary Safety for Return Types

**All return values must be DLL-safe.** Plain base types are safe; complex types must be wrapped in `Base::Interop` wrappers:

**Plain Base Types (DLL-safe, no wrapping needed):**
- `void`
- Fundamental types: `bool`, `int`, `uint32_t`, `float`, `double`, etc.
- POD structs (Plain Old Data): `Base::Math::Rect<T>`, simple numeric types
- Raw pointers of POD types: `void*`

**Complex Types (Must wrap in Base::Interop):**
- Interface pointers: `Base::Interop::RawRef<IWindow>` or `Base::Interop::SharedRef<IWindow>`
- Buffer objects: `Base::Interop::SharedRef<Base::IBuffer>`
- String/view types: `Base::Interop::StringView`
- Collections: `Base::Interop::SharedRef<Base::IDataList<T>>`
- Custom objects with virtual methods or non-standard layout

### 2.3 Interop Wrapper Types

### 2.3.1 `SharedRef<T>` - Reference-Counted Ownership
Use when returning newly created or managed objects that need lifetime control:

```cpp
// [ok] CORRECT: Returning newly created interface instance
Base::Interop::SharedRef<Interface::Archive::IArchive> createArchive(
    const Base::Interop::StringView& root_path) override
{
    return Base::Interop::SharedRef<Interface::Archive::IArchive>
        ::createInstance<OSFileSystemArchive>(root_path);
    // Caller owns the instance; automatically freed when all references drop
}

// [ok] CORRECT: Returning buffer with automatic cleanup
Base::Interop::SharedRef<Base::IBuffer> aquireFileBuffer(
    const Base::Interop::StringView& file_path) override
{
    void* buffer = Base::Memory::malloc(size);
    // ... read file into buffer ...

    return Base::Interop::SharedRef<Base::IBuffer>::createInstance<Base::Buffer>(
        buffer,
        size,
        [](const void* data, size_t)
        {
            Base::Memory::free(const_cast<void*>(data));  // Custom cleanup
        }
    );
}
```

### 2.3.2 `RawRef<T>` - Non-Owning Reference
Use for references to existing objects, window pointers, or temporary access:

```cpp
// [ok] CORRECT: Returning existing window (not created by this method)
Base::Interop::RawRef<IWindow> getMainWindow() override
{
    return Base::Interop::RawRef<IWindow>(m_main_window);
    // Caller does NOT own; must not delete
}

// [ok] CORRECT: Taking interface reference as parameter
void destroyWindow(Base::Interop::RawRef<IWindow> window) override
{
    IWindow* win = window.get();
    // ... destroy ...
}

// [ok] CORRECT: Caching references to passed-in interfaces
Base::Interop::RawRef<IRenderSurface> createSurface(
    Base::Interop::RawRef<IWindowManager> window_manager,
    Base::Interop::RawRef<IWindow> window) override
{
    // window_manager and window are not owned; just store references
    m_window_manager = window_manager;
    return Base::Interop::RawRef<IRenderSurface>(m_created_surface);
}
```

### 2.3.3 StringView - Safe String Passing
Use instead of `const char*` or `std::string&` for interface boundaries:

```cpp
// [x] WRONG: Direct std::string reference (non-DLL-safe)
class IArchive {
    virtual void loadPath(const std::string& path) = 0;
};

// [ok] CORRECT: StringView for DLL boundary
class IArchive {
    virtual void loadPath(const Base::Interop::StringView& path) = 0;
};

// Usage in implementation:
void OSFileSystemArchive::loadPath(const Base::Interop::StringView& path) override
{
    std::filesystem::path fspath(path.getString());
    // ... use fspath ...
}
```

### 2.4 Complete Interface Example

```cpp
namespace Arieo::Interface::Archive
{
    // [ok] Interface definition
    class IArchive
    {
    public:
        // Accepts StringView (DLL-safe), returns SharedRef (owned)
        virtual Base::Interop::SharedRef<Base::IBuffer> aquireFileBuffer(
            const Base::Interop::StringView& related_path) = 0;
    };

    class IArchiveManager
    {
    public:
        // Accepts StringView, returns SharedRef to newly created instance
        virtual Base::Interop::SharedRef<IArchive> createArchive(
            const Base::Interop::StringView& root_path) = 0;
    };
}

// [ok] Concrete implementation
class OSFileSystemArchive final : public Interface::Archive::IArchive
{
private:
    std::filesystem::path m_root_path;

public:
    Base::Interop::SharedRef<Base::IBuffer> aquireFileBuffer(
        const Base::Interop::StringView& related_path) override
    {
        std::filesystem::path full_path = m_root_path / related_path.getString();
        
        std::ifstream file(full_path, std::ios::binary | std::ios::ate);
        if (file.is_open() == false)
        {
            Core::Logger::error("Cannot open file: {}", full_path.string());
            return nullptr;  // Return empty SharedRef safely
        }
        
        size_t buffer_size = file.tellg();
        void* buffer = Base::Memory::malloc(buffer_size);
        file.seekg(0, std::ios::beg);
        file.read((char*)buffer, buffer_size);
        file.close();
        
        // Return with automatic cleanup on last reference drop
        return Base::Interop::SharedRef<Base::IBuffer>::createInstance<Base::Buffer>(
            buffer,
            buffer_size,
            [](const void* data, size_t)
            {
                Base::Memory::free(const_cast<void*>(data));
            }
        );
    }
};

class OSFileSystemArchiveManager final : public Interface::Archive::IArchiveManager
{
public:
    Base::Interop::SharedRef<Interface::Archive::IArchive> createArchive(
        const Base::Interop::StringView& root_path) override
    {
        std::filesystem::path root_path_fs(root_path.getString());
        
        if (std::filesystem::exists(root_path_fs) == false)
        {
            Core::Logger::error("Invalid archive root path: {}", root_path.getString());
            return nullptr;
        }
        
        return Base::Interop::SharedRef<Interface::Archive::IArchive>
            ::createInstance<OSFileSystemArchive>(root_path_fs);
    }
};
```

## 3. Memory Management

- **Never use raw `new`/`delete` or `malloc`/`free`.** All memory allocation must go through the custom allocator system.
- **Allocation and deallocation must be paired in the same scope.** Never separate `new` from `delete`, `malloc` from `free`, or `createXXX` from `destroyXXX`.
  - All `new` calls must have corresponding `delete` in the same function or be wrapped in `SharedRef`/`std::unique_ptr`.
  - All `malloc` calls must have corresponding `free` in the same function or wrapped with cleanup.
  - All `createXXX` calls must have corresponding `destroyXXX` in the same class destructor or cleanup method.

### 3.1 Use `Base::newT<T>()` and `Base::deleteT<T>()` for Heap Allocation

```cpp
// [x] WRONG: new and delete not in same scope
class DataProcessor
{
    void* m_buffer = nullptr;
public:
    void init()
    {
        m_buffer = Base::newT<DataBuffer>();  // Allocation here
    }
    ~DataProcessor()
    {
        Base::deleteT(m_buffer);  // Deallocation in destructor - WRONG! Different scopes
    }
};

// [ok] CORRECT: new and deleteT in same function, wrapped in smart pointer
class DataProcessor
{
    std::unique_ptr<DataBuffer> m_buffer;
public:
    void init()
    {
        m_buffer = std::unique_ptr<DataBuffer>(Base::newT<DataBuffer>());
        // Destructor automatically handles deleteT via unique_ptr
    }
};

// [ok] CORRECT: new/deleteT in same function scope
void processData(const std::vector<uint8_t>& input_data)
{
    DataBuffer* temp_buffer = Base::newT<DataBuffer>(input_data.size());
    temp_buffer->load(input_data);
    temp_buffer->process();
    Base::deleteT(temp_buffer);  // Paired in same function
}
```

### 3.2 Create/Destroy Pairing in Classes

```cpp
// [x] WRONG: createXXX without destroyXXX
class WindowManager
{
public:
    IWindow* createWindow()
    {
        return Base::newT<WindowImpl>();  // Allocated but no paired destroy!
    }
    // No destroy method - memory leak!
};

// [ok] CORRECT: createXXX and destroyXXX paired in same class
class WindowManager
{
private:
    std::unordered_set<Base::Interop::RawRef<IWindow>> m_windows;

public:
    Base::Interop::RawRef<IWindow> createWindow(uint32_t width, uint32_t height)
    {
        IWindow* window = Base::newT<WindowImpl>(width, height);
        m_windows.insert(Base::Interop::RawRef<IWindow>(window));
        return Base::Interop::RawRef<IWindow>(window);
    }
    
    void destroyWindow(Base::Interop::RawRef<IWindow> window)
    {
        m_windows.erase(window);
        WindowImpl* impl = window.castToInstance<WindowImpl>();
        Base::deleteT(impl);  // Paired destroy in same class
    }
};

// Usage - create and destroy visible
WindowManager window_manager;
auto main_window = window_manager.createWindow(1920, 1080);
// ... use window ...
window_manager.destroyWindow(main_window);  // Explicit pairing visible
```

### 3.3 Buffer Allocation with Lambda Deleters

**Use lambda deleters to pair allocation and deallocation in the same scope.** When returning a resource from a function, capture the allocation's cleanup logic in the lambda so the pairing remains visible and enforced in one location. This prevents deallocation logic from being scattered across different scopes or functions.

```cpp
// [ok] CORRECT: malloc paired with free in nested lambda - same scope pairing
void* buffer = nullptr;
size_t buffer_size = entry.uncompressed_size;
buffer = Base::Memory::malloc(buffer_size);  // Allocation here

// Copy or decompress data into buffer
std::memcpy(buffer, compressed_data.data(), buffer_size);

// Return with automatic cleanup - malloc/free paired in lambda of same scope
return Base::Interop::SharedRef<Base::IBuffer>::createInstance<Base::Buffer>(
    buffer, 
    buffer_size,
    [](const void* ptr, size_t)
    {  // Lambda captures cleanup at allocation site
        Base::Memory::free(const_cast<void*>(ptr));  // Deallocation paired here
    }
);

// [x] WRONG: Deallocation scattered in different scopes
Base::IBuffer* buffer_wrong = Base::newT<Base::Buffer>(data, size);
// ... buffer used elsewhere ...
// Someone must remember to delete in unknown distant scope
// ->Increases risk of memory leaks and scattered responsibility
```

### 3.4 Resource Stack Pattern (RAII)

**RAII means resource acquisition is bound to object lifetime.** Acquire the resource in a constructor or local object's setup path, and release it automatically in the destructor when the object leaves scope.

Use RAII to make cleanup deterministic and local:

- File handles should close when the wrapper leaves scope.
- Locks should unlock when the guard leaves scope.
- Temporary buffers or staging objects should be destroyed when the phase that needs them is finished.
- If a temporary local is only needed for part of a function, create an inner block so destruction happens at the end of that block instead of at the end of the whole function.
- If a step is only called once from one function, keep it local with an inner scoped block instead of extracting a one-use helper function.

This keeps ownership visible, reduces accidental lifetime extension, and avoids cleanup code being scattered across later branches or return paths.

```cpp
// [ok] CORRECT: Resource acquisition in constructor, release in destructor (RAII)
class FileHandle
{
private:
    FILE* m_file = nullptr;
    std::string m_file_path;

public:
    FileHandle(const Base::Interop::StringView& file_path, const char* mode) 
        : m_file_path(file_path.getString())
    {
        
        m_file = fopen(m_file_path.c_str(), mode);  // Acquire
        
        if (m_file == nullptr)
        {
            Core::Logger::fatal("Failed to open file: {}", m_file_path);
            return;
        }
    }
    
    ~FileHandle()
    {
        if (m_file != nullptr)
        {
            fclose(m_file);  // Release
            m_file = nullptr;
        }
    }
    
    FILE* get() const
    {
        return m_file;
    }
};

// Usage - pairing automatic
{
    FileHandle config_file("config.txt", "r");
    if (config_file.get() != nullptr)
    {
        // ... process file ...
    }
}  // Automatically closed when FileHandle is destroyed

// [ok] CORRECT: Use an inner scope for a temporary local used in one phase
void loadArchive(const Base::Interop::StringView& file_path)
{
    Base::Interop::SharedRef<Base::IBuffer> archive_buffer;

    {
        FileHandle archive_file(file_path, "rb");
        if (archive_file.get() == nullptr)
        {
            return;
        }

        archive_buffer = readWholeFile(archive_file.get());
    }

    // FileHandle is already destroyed here; only archive_buffer remains alive
    parseArchive(archive_buffer);
}

// [ok] CORRECT: Limit a temporary lock's lifetime with a nested block
void updateScene(Scene& scene)
{
    {
        std::lock_guard<std::mutex> scene_lock(scene.mutex);
        scene.prepareFrameData();
        scene.compactDirtyNodes();
    }

    // Lock is released before the expensive work below begins
    scene.buildRenderLists();
    scene.submitFrame();
}

// [ok] CORRECT: Treat an inner RAII block as the local anonymous phase of the function
void initializeRenderer(Renderer& renderer)
{
    {
        FileHandle config_file("renderer.json", "rb");
        if (config_file.get() == nullptr)
        {
            return;
        }

        auto config_buffer = readWholeFile(config_file.get());
        renderer.applyConfig(config_buffer);
    }

    // Temporary file handle and config buffer are already gone here
    renderer.createDeviceObjects();
    renderer.startFrameLoop();
}

// [x] WRONG: One-use helper function spreads one local phase across multiple scopes
static void loadRendererConfig(Renderer& renderer)
{
    FileHandle config_file("renderer.json", "rb");
    if (config_file.get() == nullptr)
    {
        return;
    }

    auto config_buffer = readWholeFile(config_file.get());
    renderer.applyConfig(config_buffer);
}

void initializeRendererWrong(Renderer& renderer)
{
    loadRendererConfig(renderer);  // Called only once; keep this phase local instead
    renderer.createDeviceObjects();
    renderer.startFrameLoop();
}

// [x] WRONG: Temporary local lives longer than needed
void loadArchiveWrong(const Base::Interop::StringView& file_path)
{
    FileHandle archive_file(file_path, "rb");
    if (archive_file.get() == nullptr)
    {
        return;
    }

    auto archive_buffer = readWholeFile(archive_file.get());

    // archive_file remains alive for the rest of the function even though it is no longer needed
    parseArchive(archive_buffer);
    buildIndex(archive_buffer);
}
```

### Summary of Pairing Rules

| Pattern | Allocation | Deallocation | Scope |
|---------|-----------|---------------|-------|
| **Immediate use** | Function start | Function end | Same function |
| **Member ownership** | Constructor/init() | Destructor | Same class |
| **Wrapped in smart ptr** | Wrapped on creation | Smart pointer cleanup | Automatic |
| **Wrapped in SharedRef** | `createInstance()` | Reference drop | Automatic |
| **Lambda cleanup** | Inside function | Lambda capture | Same function |


## 4. Unsafe Functions - Forbidden

- **Never use unsafe C functions:** `strcpy`, `strcat`, `memcpy`, `memset`, `sprintf`, `scanf`.
- Use safe variants instead:
  - `strcpy` --> `strcpy_s` (or `std::string` assignment)
  - `strcat` --> `strcat_s` (or `std::string::append`)
  - `memcpy` --> `memcpy_s` (or `std::copy`)
  - `memset` ->Standard C++ alternatives or `std::fill`
  - `sprintf` --> `Base::StringUtility::format` (see String Formatting section)
  - `scanf` --> `std::istringstream` or proper parsers

Example:
```cpp
// [x] WRONG: Unsafe functions
char buffer[256];
strcpy(buffer, user_input);  // Buffer overflow risk!
sprintf(buffer, "Value: %d", count);  // Format injection risk!
memcpy(dest, src, size);  // No bounds checking

// [ok] CORRECT: Safe alternatives
std::string buffer = user_input;  // std::string is safe
auto formatted = Base::StringUtility::format("Value: {}", count);  // Type-safe formatting
std::copy(src.begin(), src.end(), dest.begin());  // Bounds-checked copy
```

## 5. String Formatting

- **Never use `printf`, `sprintf`, or `fprintf`.** Always use `Base::StringUtility::format`.
- `Base::StringUtility::format` uses the fmt library for type-safe, efficient string formatting.
- Format strings use `{}` placeholders with automatic type deduction.

Example:

```cpp
// [x] WRONG: sprintf
char buffer[256];
sprintf(buffer, "Device: %s, Frame Count: %d", device_name, count);

// [ok] CORRECT: Base::StringUtility::format
auto formatted = Base::StringUtility::format("Device: {}, Frame Count: {}", device_name, count);
```

- Use with Logger for consistent logging.

Example:

```cpp
// Direct logging with format
Core::Logger::info("Creating interface instance for ID {}", interface_id);
Core::Logger::error("Device Name: {}\n", device_properties.deviceName);
Core::Logger::warn("Buffer allocation failed: size={}, alignment={}", size, alignment);

// Or format first, then log
auto error_msg = Base::StringUtility::format(
        "Failed to initialize render device: handle={}, error_code={}",
        device_handle, error_code
);
Core::Logger::error("{}", error_msg);
```

- Supported format types (via fmt).

Example:

```cpp
Core::Logger::info("Integer: {}, Float: {:.2f}, Bool: {}, String: {}",
                                     42, 3.14159, true, "example");
// Output: Integer: 42, Float: 3.14, Bool: true, String: example
```

## 6. Error Handling

- **Fail fast, not fail-safe:** Do not use defensive/protective coding unnecessarily. Let errors crash where they should occur so bugs are exposed early.
- **Do not design APIs with `bool` return values to indicate success/failure.** A bare boolean hides error context and encourages silent failure paths.
- Only add fallback logic when it provides genuine value; avoid redundant safety checks that mask underlying issues.
- When fallback exists, log the error or warning **before** attempting recovery.
- For expected recoverable outcomes, return a meaningful type (`nullptr`, optional object, explicit error object), not `bool`.
- Example:
```cpp
// [x] WRONG: bool return hides why operation failed
bool initializeArchive(const Base::Interop::StringView& path)
{
    if (path.empty())
    {
        return false;
    }

    if (openArchive(path) == false)
    {
        return false;
    }

    return true;
}

// [ok] CORRECT: fail fast for programming errors, explicit return for recoverable result
Base::Interop::SharedRef<IArchive> createArchive(const Base::Interop::StringView& path)
{
    ARIEO_ASSERT(path.empty() == false); // Programming contract

    auto archive = tryOpenArchive(path);
    if (archive.isNull() == true)
    {
        Core::Logger::error("Archive open failed: path={}", path.getString());
        return nullptr; // Recoverable failure with explicit type
    }

    return archive;
}

// [x] WRONG: Defensive coding that masks bugs
if (device != nullptr && device->isValid())
{
    device->render();
}
// If device is invalid, silently fails. Better to crash and fix the bug!

// [ok] CORRECT: Fail fast - let it crash
device->render(); // Crashes if device is nullptr or invalid
                  // This is the right place to fix the bug

// [ok] CORRECT: Fallback with logging (when fallback has real value)
if (primary_device == nullptr)
{
  Core::Logger::warn("Primary render device failed; attempting fallback");
  primary_device = createFallbackDevice();
  if (primary_device == nullptr)
  {
      Core::Logger::fatal("Fallback device creation failed; cannot continue");
      return nullptr;
  }
}
```

## 7. Logging

- Always use `Core::Logger::trace()`, `Core::Logger::error()`, `Core::Logger::fatal()`, and other logger methods. **Never use `printf` or stream-based logging.**
- Log failures with actionable context (operation + relevant identifier/error code).
- Use logger levels consistently: `trace` (detailed execution flow), `error` (recoverable failures), `fatal` (unrecoverable failures).
- Example:
```cpp
if (device == nullptr)
{
    Core::Logger::error("Failed to initialize render device: invalid handle");
    return false;
}
Core::Logger::trace("Render device initialized successfully");
```

## 8. Includes

### 8.1 Header Files (`.h`) Rules

- Every header file must start with `#pragma once`.
- Include as few headers as possible in `.h` files.
- Prefer forward declarations in `.h`, and move concrete include dependencies into `.cpp` whenever possible.

Example:

```cpp
// [x] WRONG: Heavy dependencies in header
#pragma once
#include "core/logger/logger.h"
#include "interfaces/archive/i_archive.h"
#include <memory>
#include <filesystem>

class ArchiveService
{
public:
    bool initialize();

private:
    std::filesystem::path m_root_path;
    std::shared_ptr<Arieo::Interface::Archive::IArchive> m_archive;
};
```

```cpp
// [ok] CORRECT: Keep header minimal, use forward declarations
#pragma once

namespace Arieo::Interface::Archive
{
    class IArchive;
}

class ArchiveService
{
public:
    bool initialize();

private:
    Arieo::Interface::Archive::IArchive* m_archive = nullptr;
};
```

```cpp
// Move heavy/relationship includes into .cpp
#include "archive_service.h"
#include "core/logger/logger.h"
#include "interfaces/archive/i_archive.h"
#include <filesystem>
```

### 8.2 Source Files (`.cpp`) Rules

- Every `.cpp` file must start with `#include "base/prerequisites.h"`.
- `prerequisites.h` is the base include for predefined/common types.

### 8.3 Include Order

Use this order in `.cpp` files:

1. C++ standard headers first, using angle brackets (`#include <...>`).
2. Engine headers from other projects/modules, using quotes (`#include "..."`) in this order:
   - `core/...`
   - `interfaces/...`
   - `base/...`
3. Third-party headers, using angle brackets (`#include <...>`)
4. Headers inside the same project, using relative quoted paths (`#include "..."`), including `../` when needed

Example:

```cpp
#include "base/prerequisites.h"

// 1) C++ standard headers
#include <filesystem>

// 2) Other engine headers (core -> interfaces -> base)
#include "core/core.h"
#include "core/config/config.h"
#include "interfaces/main/i_main_module.h"
#include "base/string/string_utility.h"

// 3) Third-party headers
#include <fmt/format.h>

// 4) Same-project headers (relative path, may use ../)
#include "../include/bootstrap_engine.h"
#include "../include/internal/bootstrap_context.h"
```

## 9. Enum Definitions

### 9.1 Always Use `enum class`

- **Always use `enum class` instead of plain `enum`.** Scoped enums prevent namespace pollution and provide type safety.
- **Never use C-style enums** unless interfacing with C APIs that explicitly require them.

Example:

```cpp
// [x] WRONG: Plain enum pollutes namespace
enum RESOURCE_STATE
{
    RESOURCE_STATE_UNKNOWN = 0,
    RESOURCE_STATE_VERTEX_BUFFER = 1
};

// Can be used as: RESOURCE_STATE_UNKNOWN (namespace pollution)

// [ok] CORRECT: Scoped enum class
enum class ResourceState : std::uint32_t
{
    Unknown = 0,
    VertexBuffer = 1
};

// Must use scoped access: ResourceState::Unknown (type-safe)
```

### 9.2 Enum Naming

- **Enum type names use `PascalCase`** (same as classes and structs).
- **Enum value names use `PascalCase`** without prefixes.
- **Remove redundant prefixes** from enum values - the enum class name provides the namespace.

Example:

```cpp
// [x] WRONG: Redundant prefixes in enum values
enum class ResourceState
{
    ResourceStateUnknown = 0,           // Redundant "ResourceState" prefix
    ResourceStateVertexBuffer = 1,      // Redundant "ResourceState" prefix
    ResourceStateIndexBuffer = 2        // Redundant "ResourceState" prefix
};

// [ok] CORRECT: Clean, concise enum values
enum class ResourceState
{
    Unknown = 0,        // Clear and concise
    VertexBuffer = 1,   // No redundant prefix
    IndexBuffer = 2     // Scoped under ResourceState::
};

// Usage: ResourceState::VertexBuffer (self-documenting)
```

### 9.3 Underlying Types

- **Always specify an explicit underlying type** for enum classes.
- Use the smallest appropriate integer type: `std::uint8_t`, `std::uint16_t`, or `std::uint32_t`.
- Use `std::uint32_t` for flag enums that need bitwise operations.
- Use `std::uint8_t` for simple state enums with few values.

Example:

```cpp
// [ok] CORRECT: Explicit underlying types
enum class ShaderType : std::uint32_t    // Flag enum - needs 32 bits for combinations
{
    Unknown = 0,
    Vertex  = 1u << 0,
    Pixel   = 1u << 1,
    Compute = 1u << 2
};

enum class ShaderStatus : std::uint8_t   // Simple state enum - 8 bits sufficient
{
    Unknown = 0,
    Compiling = 1,
    Ready = 2,
    Failed = 3
};
```

### 9.4 Flag Enums and Bitmask Operations

- **For flag enums that support bitwise operations, use `ARIEO_ENABLE_BITMASK_OPERATORS` macro.**
- Flag enum values should use bit shifts (`1u << n`) for individual flags.
- Combined flags can reference individual flags by name.

Example:

```cpp
// [ok] CORRECT: Flag enum with bitmask operators
enum class BindShaderResourcesFlags : std::uint32_t
{
    UpdateStatic  = 1u << 0,
    UpdateMutable = 1u << 1,
    UpdateDynamic = 1u << 2,
    UpdateAll     = UpdateStatic | UpdateMutable | UpdateDynamic,  // Combine by name
    KeepExisting  = 1u << 3
};
ARIEO_ENABLE_BITMASK_OPERATORS(BindShaderResourcesFlags)

// Usage: Supports type-safe bitwise operations
BindShaderResourcesFlags flags = BindShaderResourcesFlags::UpdateStatic | BindShaderResourcesFlags::KeepExisting;
```

### 9.5 Default Values in Struct Members

- **Always provide meaningful defaults for enum members in structs.**
- Use fully qualified scope (`EnumType::Value`) when initializing enum members.
- Choose the most reasonable default value (usually the "Unknown", "None", or "Default" state).

Example:

```cpp
// [ok] CORRECT: Meaningful defaults with fully qualified scope
struct BufferViewDesc
{
    BufferViewType m_view_type = BufferViewType::Undefined;  // Clear default state
    std::uint64_t m_byte_offset = 0;
    std::uint64_t m_byte_width = 0;
};

struct ShaderDesc
{
    ShaderType m_shader_type = ShaderType::Unknown;  // Explicit unknown state
};

struct TextureViewDesc
{
    TextureViewType m_view_type = TextureViewType::Undefined;  // Safe default
    std::uint32_t m_format = 0;
    std::uint32_t m_most_detailed_mip = 0;
    std::uint32_t m_num_mip_levels = 1;  // Reasonable default (not 0)
    std::uint32_t m_first_array_slice = 0;
    std::uint32_t m_num_array_slices = 1;  // Reasonable default (not 0)
};
```

### 9.6 Complete Enum Example

```cpp
// [ok] CORRECT: Complete enum definition following all rules
enum class ResourceState : std::uint32_t
{
    Unknown         = 0,          // Clear default state
    VertexBuffer    = 1u << 0,    // Bit flag for combinations
    IndexBuffer     = 1u << 1,    // No redundant "ResourceState" prefix
    ConstantBuffer  = 1u << 2,    // PascalCase naming
    ShaderResource  = 1u << 3,    // Descriptive and concise
    UnorderedAccess = 1u << 4,
    RenderTarget    = 1u << 5,
    DepthWrite      = 1u << 6,
    CopyDest        = 1u << 7,
    CopySource      = 1u << 8
};
ARIEO_ENABLE_BITMASK_OPERATORS(ResourceState)  // Enable type-safe bitwise operations

// Usage in struct with proper default
struct BufferDesc
{
    ResourceState m_initial_state = ResourceState::Unknown;  // Fully qualified default
    std::uint64_t m_size = 0;
    std::uint32_t m_bind_flags = 0;
};

// Usage in code - type-safe and self-documenting
void transitionBuffer(ResourceState from_state, ResourceState to_state)
{
    if (from_state == ResourceState::Unknown)
    {
        Core::Logger::error("Cannot transition from unknown state");
        return;
    }
    
    // Bitwise operations work with ARIEO_ENABLE_BITMASK_OPERATORS
    ResourceState combined = ResourceState::VertexBuffer | ResourceState::IndexBuffer;
    if ((to_state & combined) != ResourceState::Unknown)
    {
        // Handle buffer state transition...
    }
}
```

### 9.7 Legacy Enum Migration

**When updating existing code:**

1. **Convert plain `enum` to `enum class`** with appropriate underlying type.
2. **Remove redundant prefixes** from enum values.
3. **Update all usage sites** to use scoped access (`Type::Value`).
4. **Add `ARIEO_ENABLE_BITMASK_OPERATORS`** for flag enums.
5. **Update struct member defaults** to use fully qualified names.
