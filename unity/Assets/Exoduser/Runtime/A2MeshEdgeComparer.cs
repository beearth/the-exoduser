using System.Collections.Generic;

namespace Exoduser.UnityPort
{
    // long 기본 해시의 high^low는 인접 그리드 정점 쌍을 몇 개 버킷에 몰아 넣는다.
    // 양쪽 정점 번호를 먼저 따로 섞어 대형 지형 경계의 이차 시간 비용을 막는다.
    public sealed class A2MeshEdgeComparer : IEqualityComparer<long>
    {
        public bool Equals(long a,long b) { return a==b; }
        public int GetHashCode(long value)
        { unchecked { return (int)((uint)(value>>32)*73856093u^(uint)value*19349663u); } }
    }
}
