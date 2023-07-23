# Example CI/CD automation with GitHub workflows

## Overview

작업 브랜치에서 dev 브랜치로 병합하는 PR 작성 이후 작업의 흐름을 자동화합니다.

## 절차

### PR 작성 (dev 👈 Working branch)

자동화의 시작점으로 사용자가 PR 을 작성합니다.

이번 병합을 잘 설명하는 라벨을 추가합니다.

> 라벨 기준으로 버전을 결정합니다.

### PR 병합 (dev 👈 Working branch)

메인 브랜치로 병합되지 않은 완료된 PR (dev 👈 Working branch) 을 검색합니다.

1. 검색된 PR 들의 라벨을 통합합니다. [^pr-to-dev-branch-from-workring-branch-1]
2. 검색된 PR 들의 번호 목록을 작성합니다. [^pr-to-dev-branch-from-workring-branch-2]

1.)[^pr-to-dev-branch-from-workring-branch-1] 2.)[^pr-to-dev-branch-from-workring-branch-2] 의 정보를 기준으로 PR(main 👈 dev) 을 작성합니다.

e.g.)
작성되는 PR 은 아래와 같습니다.

Title: Main #기반 브랜치 이름
Body:

```makrdown
## Description
<!-- 2) 에서 작성된 PR 번호 목록 -->
- #10
- #9
Labels:
- enhancement
- bug
```

### PR 병합 (main 👈 dev)

PR 검토후 사용자가 병합합니다.

1. PR 의 라벨들을 기준으로 다음 버전이름을 결정합니다.
2. 다음 버전 이름을 깃 태그를 작성합니다.
3. 다음 버전 이름으로 깃허브 릴리즈를 작성합니다. (초안)

필요시 깃허브 릴리즈를 발행하여 후속 작업을 실행합니다. (사용자의 결정)

PR 작성 (dev 👈 Working branch) 절차를 계속합니다.

### 깃허브 릴리즈 발행 (published)

> 깃 태그가 작성된 커밋 기준으로 패키지 발행 등의 작업을 진행할 수 있습니다.

릴리즈가 발행되는 경우 이후 작성을 실행합니다.
