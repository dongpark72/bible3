# Bible Serverless Project Setup Guide

이 프로젝트는 Cloudflare Pages, Workers, R2, D1을 사용하여 구축된 서버레스 성경 웹 애플리케이션입니다.

## 1. Cloudflare 설정 단계

### 1.1 R2 저장소 설정
1. Cloudflare Dashboard -> **R2** -> **Create bucket** 클릭.
2. 버킷 이름을 `bible-assets`로 생성 (다른 이름을 쓸 경우 `wrangler.jsonc` 수정 필요).
3. `E:\Antigravity\debian\bible\data\r2` 폴더의 모든 내용을 버킷의 `bible/` 경로에 업로드합니다.
   - 예: `bible/ko/gn.json`, `bible/ko/metadata.json` 등이 있어야 함.

### 1.2 D1 데이터베이스 설정
1. Cloudflare Dashboard -> **D1** -> **Create database** 클릭.
2. 데이터베이스 이름을 `bible-db`로 생성.
3. 생성된 데이터베이스의 **ID**를 복사하여 `wrangler.jsonc`의 `database_id`에 붙여넣습니다.
4. 스키마 초기화 명령어를 실행합니다:
   ```bash
   npx wrangler d1 execute bible-db --file=workers/schema.sql --remote
   ```

### 1.3 Wrangler 설정 (wrangler.jsonc)
`wrangler.jsonc` 파일에 본인의 `database_id`가 정확히 입력되었는지 확인하세요.

## 2. 배포 방법

터미널에서 아래 명령어를 실행하여 전체 프로젝트(프론트엔드 + 백엔드)를 배포합니다.
```bash
npx wrangler deploy
```

## 3. 주요 변경 사항

- **데이터 온디맨드 로딩**: 이전에는 5MB의 성경 데이터를 한 번에 받았으나, 이제는 각 권(Book)별로 필요할 때만 R2에서 불러옵니다.
- **D1 연동**: 로그인 정보와 읽기 기록이 클라우드 데이터베이스에 저장되어 여러 기기에서 동기화됩니다.
- **Serverless Architecture**: 별도의 서버 없이 Cloudflare의 엣지망에서 모든 로직이 돌아갑니다.

## 4. 참고 사항
- 첫 로그인 시에는 데이터베이스에 사용자가 없으므로, Worker 로직에서 회원가입 처리 등을 추가로 보강할 수 있습니다. (현재는 단순 조회만 구현됨)
- 검색 기능은 현재 로드된 성경 데이터에 대해서만 작동합니다. 전체 검색을 위해서는 서버 검색 로직 구현이 권장됩니다.
