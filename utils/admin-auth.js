export function validateAdminToken(request, env) {
  const auth = request.headers.get("Authorization");

  if (!auth || !auth.startsWith("Bearer ")) {
    return false;
  }

  const token = auth.substring(7);

  return token === env.ADMIN_TOKEN;
}
