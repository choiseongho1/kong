# 📋 한 줄 일기 앱 백엔드 실행 가이드

이 문서는 **백엔드 지식이 전혀 없는 사람도** 쉽게 따라할 수 있도록 작성되었습니다. 하나씩 천천히 따라 해보세요! 🚀

---

## ✅ 준비물 (설치해야 하는 것들)

1️⃣ **Java (자바) 설치하기**
- [Java 17 다운로드 링크](https://www.oracle.com/java/technologies/javase-jdk17-downloads.html)
- 설치 후, 제대로 설치되었는지 확인하기:
  ```bash
  java -version
  ```
  - 버전이 `17` 이상으로 나오면 성공!

2️⃣ **Git 설치하기** (코드 받기 위해 필요)
- [Git 다운로드 링크](https://git-scm.com/downloads)

3️⃣ **Docker 설치하기** (Redis와 백엔드 실행에 필요)
- [Docker 다운로드 링크](https://www.docker.com/products/docker-desktop/)

---

## 📦 프로젝트 다운로드 방법

1️⃣ **Git으로 코드 다운로드하기**
```bash
git clone https://github.com/your-repo/kong_back.git
cd kong_back
```

*만약 Git이 어려우면 GitHub에서 ZIP 파일로 다운로드한 후 압축을 풀어도 됩니다.*

---

## ⚙️ JAR 파일 빌드하기 (필수)

백엔드 애플리케이션을 실행하려면 먼저 JAR 파일을 만들어야 합니다.

1️⃣ **빌드 명령어 실행:**
```bash
./gradlew clean bootJar -x test  # Linux/Mac
# 또는
gradlew.bat clean bootJar -x test  # Windows
```

2️⃣ **JAR 파일 확인:**
```bash
ls build/libs
```
- `kong_back.jar` 파일이 생성되어 있어야 합니다.

---

## 🚀 백엔드 실행하기 (초간단)

### 1️⃣ **Docker로 Redis와 백엔드 서버 실행하기**

빌드가 완료된 후 다음 명령어로 실행하세요:
```bash
docker-compose up --build
```
- 이 명령어 하나로 **Redis**와 **백엔드 애플리케이션**이 자동으로 빌드 및 실행됩니다.
- 서버가 정상적으로 실행되는지 확인한 후 종료하려면 `Ctrl + C`를 누르세요.

### 2️⃣ **백그라운드로 실행하기 (옵션)**
```bash
docker-compose up -d
```
- `-d` 옵션은 백그라운드에서 실행되도록 합니다.
- 실행 중인 컨테이너 확인:
  ```bash
  docker ps
  ```

### 3️⃣ **서버 중지하기**
```bash
docker-compose down
```
- 실행 중인 모든 컨테이너가 종료됩니다.

---

## 🌐 백엔드가 잘 실행됐는지 확인하기

1️⃣ **웹 브라우저 열기 (Chrome, Edge 등)**

2️⃣ 주소창에 입력:
```
http://localhost:8080
```

3️⃣ 페이지가 열리면 성공! 🎉

*API 문서가 보고 싶다면:*
```
http://localhost:8080/swagger-ui/index.html
```

---

## 🛠️ 자주 발생하는 문제 해결법

- ❗ **포트 오류가 발생했나요?**
  - 다른 프로그램이 8080 포트를 사용 중일 수 있어요.
  - `docker-compose.yml` 파일에서 포트를 수정해 보세요.

- ❗ **Docker 컨테이너가 정상적으로 실행되지 않나요?**
  ```bash
  docker-compose down
  docker-compose up --build
  ```

- ❗ **JAR 파일을 찾을 수 없다는 오류 발생 시:**
  - 빌드가 제대로 되었는지 확인하세요:
    ```bash
    ls build/libs
    ```
  - JAR 파일이 없으면 다시 빌드하세요:
    ```bash
    ./gradlew clean bootJar -x test
    ```

- ❗ **의존성 오류가 발생했나요?** (수동 빌드 시)
  ```bash
  ./gradlew clean build --refresh-dependencies
  ```

---

## 🚀 백엔드 테스트 (선택 사항)

```bash
./gradlew test
```

테스트가 모두 성공하면 정상적으로 작동 중입니다! ✅

---

## 🙋‍♂️ 도움이 필요할 때는?

- 개발자에게 문의하기 📩
- 오류 메시지를 그대로 캡처해서 전달하면 도움이 됩니다!

---

이 가이드를 따라 실행에 성공했다면, 이제 프론트엔드 개발을 진행할 준비가 완료된 거예요. 👏🎉
